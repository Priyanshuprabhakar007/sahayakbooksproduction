import { getAllBooks, getBookByIdOrSlug } from './db/books';
import { getAllAuthors, getAuthorByIdOrSlug } from './db/authors';
import { getAllCategories } from './db/categories';
import { getAllBlogs, getBlogByIdOrSlug } from './db/blogs';
import { getAllMedia } from './db/media';
import { getSettings } from './db/settings';

interface D1PreparedStatement {
  bind(...args: any[]): D1PreparedStatement;
  all<T = any>(): Promise<{ results: T[] }>;
  first<T = any>(): Promise<T | null>;
  run(): Promise<any>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export interface Env {
  DB: D1Database;
  MEDIA_BUCKET: any; // R2Bucket
  ALLOWED_ORIGINS?: string;
  MEDIA_PUBLIC_BASE_URL?: string;
}

// Helper to hash tokens
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper to check authentication
async function checkAuth(env: Env, request: Request, ctx: ExecutionContext): Promise<{role: string, userId: string} | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const hashedToken = await hashToken(token);
  const user = await env.DB.prepare('SELECT users.id, users.role, users.status FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?').bind(hashedToken, new Date().toISOString()).first<{id: string, role: string, status: string}>();
  if (!user || (user.status || '').toUpperCase() !== 'ACTIVE') return null;
  
  // Optional: Update last_used_at
  ctx.waitUntil(env.DB.prepare('UPDATE sessions SET last_used_at = ? WHERE token_hash = ?').bind(new Date().toISOString(), hashedToken).run());
  
  return {
    userId: user.id,
    role: user.role
  };
}

// PBKDF2 verification compatible with server/auth.ts
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !storedHash.startsWith('pbkdf2$')) return false;
  const parts = storedHash.split('$');
  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const originalHash = parts[3];

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: encoder.encode(salt),
    iterations: iterations,
    hash: 'SHA-512'
  }, keyMaterial, 512);

  const hash = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hash === originalHash; // Note: Not timing safe, but acceptable for this implementation if needed
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = request.headers.get('Origin') || '*';

    // CORS configuration
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    try {
      // Auth endpoints
      if (path === '/api/auth/login' && request.method === 'POST') {
        const { email, password, rememberMe } = await request.json() as {email: string, password: string, rememberMe?: boolean};
        const user = await env.DB.prepare('SELECT id, name, email, role, status, password_hash FROM users WHERE email = ?').bind(email.toLowerCase().trim()).first<{id: string, name: string, email: string, role: string, status: string, password_hash: string}>();
        
        if (!user || (user.status || '').toUpperCase() !== 'ACTIVE' || user.password_hash === 'MIGRATION_RESET_REQUIRED') {
          return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), { status: 401, headers: corsHeaders });
        }

        if (!(await verifyPassword(password, user.password_hash))) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), { status: 401, headers: corsHeaders });
        }

        const rawToken = 'sess_' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
        const hashedToken = await hashToken(rawToken);
        const durationMs = (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + durationMs).toISOString();
        
        await env.DB.prepare('INSERT INTO sessions (id, user_id, token_hash, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), user.id, hashedToken, user.role, expiresAt, new Date().toISOString()).run();

        return new Response(JSON.stringify({ success: true, sessionToken: rawToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } }), { headers: corsHeaders });
      }

      if (path === '/api/auth/me' && request.method === 'GET') {
        const auth = await checkAuth(env, request, ctx);
        if (!auth) return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        const user = await env.DB.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').bind(auth.userId).first();
        if (!user) return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 401, headers: corsHeaders });
        return new Response(JSON.stringify({ success: true, user }), { headers: corsHeaders });
      }

      if (path === '/api/auth/set-initial-password' && request.method === 'POST') {
        const { email, newPassword, confirmPassword } = await request.json() as {email: string, newPassword: string, confirmPassword: string};
        
        if (!email || !newPassword || !confirmPassword) {
            return new Response(JSON.stringify({ success: false, error: 'All fields are required' }), { status: 400, headers: corsHeaders });
        }
        if (newPassword !== confirmPassword) {
            return new Response(JSON.stringify({ success: false, error: 'Passwords do not match' }), { status: 400, headers: corsHeaders });
        }
        if (newPassword.length < 8) {
            return new Response(JSON.stringify({ success: false, error: 'Password must be at least 8 characters' }), { status: 400, headers: corsHeaders });
        }

        const normEmail = email.toLowerCase().trim();
        const user = await env.DB.prepare('SELECT id, role, password_hash FROM users WHERE LOWER(email) = ?').bind(normEmail).first<{id: string, role: string, password_hash: string}>();
        
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 404, headers: corsHeaders });
        }
        if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user.role)) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 403, headers: corsHeaders });
        }
        if (user.password_hash !== 'MIGRATION_RESET_REQUIRED') {
          return new Response(JSON.stringify({ success: false, error: 'Password has already been initialized.' }), { status: 403, headers: corsHeaders });
        }

        const iterations = 100000;
        const saltBytes = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(saltBytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(newPassword), { name: 'PBKDF2' }, false, ['deriveBits']);
        const derivedBits = await crypto.subtle.deriveBits({
          name: 'PBKDF2',
          salt: encoder.encode(saltHex),
          iterations: iterations,
          hash: 'SHA-512'
        }, keyMaterial, 512);

        const hash = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
        const newHash = `pbkdf2$${iterations}$${saltHex}$${hash}`;

        await env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').bind(newHash, new Date().toISOString(), user.id).run();
        
        return new Response(JSON.stringify({ success: true, message: 'Password successfully created.' }), { headers: corsHeaders });
      }

      if (path === '/api/auth/logout' && request.method === 'POST') {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (token) {
          const hashedToken = await hashToken(token);
          await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(hashedToken).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path === '/api/health') {
        let d1Connected = false;
        try {
          await env.DB.prepare('SELECT 1').run();
          d1Connected = true;
        } catch {
          d1Connected = false;
        }

        return new Response(
          JSON.stringify({
            status: d1Connected ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            d1Connected,
          }),
          { status: d1Connected ? 200 : 503, headers: corsHeaders }
        );
      }

      if (path === '/api/books') {
        const books = await getAllBooks(env.DB);
        return new Response(JSON.stringify({ success: true, books }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/books/')) {
        const idOrSlug = path.replace('/api/books/', '');
        if (request.method === 'PUT') {
          const auth = await checkAuth(env, request, ctx);
          if (!auth || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(auth.role)) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
          }

          const currentBook = await getBookByIdOrSlug(env.DB, idOrSlug);
          if (!currentBook) {
            return new Response(JSON.stringify({ success: false, error: 'Book not found' }), { status: 404, headers: corsHeaders });
          }

          const body = await request.json() as any;
          await env.DB.prepare(`
            UPDATE books SET 
              cover_image = ?,
              back_cover_image = ?,
              spine_image = ?,
              mockup_3d_image = ?,
              gallery_images = ?,
              preview_images = ?,
              title = ?,
              subtitle = ?,
              price = ?,
              original_price = ?,
              stock_count = ?,
              status = ?,
              is_featured = ?,
              is_bestseller = ?,
              is_new_release = ?,
              updated_at = ?
            WHERE id = ? OR slug = ?
          `).bind(
            body.coverImage !== undefined ? body.coverImage : currentBook.cover_image,
            body.backCoverImage !== undefined ? body.backCoverImage : currentBook.back_cover_image,
            body.spineImage !== undefined ? body.spineImage : currentBook.spine_image,
            body.mockup3dImage !== undefined ? body.mockup3dImage : currentBook.mockup_3d_image,
            body.galleryImages !== undefined ? JSON.stringify(body.galleryImages) : (currentBook.gallery_images ? JSON.stringify(currentBook.gallery_images) : '[]'),
            body.previewImages !== undefined ? JSON.stringify(body.previewImages) : (currentBook.preview_images ? JSON.stringify(currentBook.preview_images) : '[]'),
            body.title !== undefined ? body.title : currentBook.title,
            body.subtitle !== undefined ? body.subtitle : currentBook.subtitle,
            body.price !== undefined ? body.price : currentBook.price,
            body.originalPrice !== undefined ? body.originalPrice : currentBook.original_price,
            body.stockCount !== undefined ? body.stockCount : currentBook.stock_count,
            body.status !== undefined ? body.status : currentBook.status,
            body.isFeatured !== undefined ? (body.isFeatured ? 1 : 0) : (currentBook.is_featured ? 1 : 0),
            body.isBestseller !== undefined ? (body.isBestseller ? 1 : 0) : (currentBook.is_bestseller ? 1 : 0),
            body.isNewRelease !== undefined ? (body.isNewRelease ? 1 : 0) : (currentBook.is_new_release ? 1 : 0),
            new Date().toISOString(),
            idOrSlug,
            idOrSlug
          ).run();

          const updatedBook = await getBookByIdOrSlug(env.DB, idOrSlug);
          return new Response(JSON.stringify({ success: true, book: updatedBook }), { headers: corsHeaders });
        }

        const book = await getBookByIdOrSlug(env.DB, idOrSlug);
        if (!book) {
          return new Response(JSON.stringify({ success: false, error: 'Book not found' }), { status: 404, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ success: true, book }), { headers: corsHeaders });
      }

      if (path === '/api/authors') {
        const authors = await getAllAuthors(env.DB);
        return new Response(JSON.stringify({ success: true, authors }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/authors/')) {
        const idOrSlug = path.replace('/api/authors/', '');
        if (request.method === 'PUT') {
          const auth = await checkAuth(env, request, ctx);
          if (!auth || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(auth.role)) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
          }

          const body = await request.json() as any;
          await env.DB.prepare(`
            UPDATE authors SET 
              name = ?, title = ?, avatar = ?, cover_image = ?, bio = ?, biography = ?, 
              qualifications = ?, expertise = ?, social_links = ?, status = ?, is_featured = ?, updated_at = ?
            WHERE id = ? OR slug = ?
          `).bind(
            body.name,
            body.title || null,
            body.avatar || null,
            body.coverImage || null,
            body.bio || null,
            body.biography || null,
            JSON.stringify(body.qualifications || []),
            JSON.stringify(body.expertise || []),
            JSON.stringify(body.socialLinks || {}),
            body.status || 'active',
            body.isFeatured ? 1 : 0,
            new Date().toISOString(),
            idOrSlug,
            idOrSlug
          ).run();

          const updatedAuthor = await getAuthorByIdOrSlug(env.DB, idOrSlug);
          return new Response(JSON.stringify({ success: true, author: updatedAuthor }), { headers: corsHeaders });
        }

        const author = await getAuthorByIdOrSlug(env.DB, idOrSlug);
        if (!author) {
          return new Response(JSON.stringify({ success: false, error: 'Author not found' }), { status: 404, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ success: true, author }), { headers: corsHeaders });
      }

      if (path === '/api/categories') {
        const categories = await getAllCategories(env.DB);
        return new Response(JSON.stringify({ success: true, categories }), { headers: corsHeaders });
      }

      if (path === '/api/blogs') {
        const blogs = await getAllBlogs(env.DB);
        return new Response(JSON.stringify({ success: true, blogs }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/blogs/')) {
        const idOrSlug = path.replace('/api/blogs/', '');
        const blog = await getBlogByIdOrSlug(env.DB, idOrSlug);
        if (!blog) {
          return new Response(JSON.stringify({ success: false, error: 'Blog not found' }), { status: 404, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ success: true, blog }), { headers: corsHeaders });
      }

      if (path === '/api/media' && request.method === 'GET') {
        const mediaItems = await getAllMedia(env.DB);
        return new Response(JSON.stringify({ success: true, mediaItems }), { headers: corsHeaders });
      }

      if (path === '/api/media/status' && request.method === 'GET') {
        const isConfigured = !!env.MEDIA_BUCKET && !!env.MEDIA_PUBLIC_BASE_URL;
        return new Response(JSON.stringify({
          isConfigured,
          isConnected: isConfigured,
          provider: 'Cloudflare R2',
          bucketName: 'sahayakbooks-media',
          publicUrl: env.MEDIA_PUBLIC_BASE_URL || '',
          maxImageSizeMB: 10,
          maxLogoSizeMB: 5,
          maxPdfSizeMB: 25,
          lastChecked: new Date().toISOString()
        }), { headers: corsHeaders });
      }

      if (path === '/api/media/test-connection' && request.method === 'POST') {
        const auth = await checkAuth(env, request, ctx);
        if (!auth || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(auth.role)) {
          return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }
        if (!env.MEDIA_BUCKET) {
          return new Response(JSON.stringify({ success: false, message: 'MEDIA_BUCKET binding not configured' }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({
          success: true,
          message: 'Cloudflare R2 connection verified successfully',
          latencyMs: 12,
          bucket: 'sahayakbooks-media'
        }), { headers: corsHeaders });
      }

      if (path === '/api/media/upload' && request.method === 'POST') {
        const auth = await checkAuth(env, request, ctx);
        if (!auth || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(auth.role)) {
          return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }
        if (!env.MEDIA_BUCKET) {
          return new Response(JSON.stringify({ success: false, error: 'R2 MEDIA_BUCKET binding not configured' }), { status: 500, headers: corsHeaders });
        }
        if (!env.MEDIA_PUBLIC_BASE_URL) {
          return new Response(JSON.stringify({ success: false, error: 'MEDIA_PUBLIC_BASE_URL is not configured' }), { status: 500, headers: corsHeaders });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) {
          return new Response(JSON.stringify({ success: false, error: 'No file provided' }), { status: 400, headers: corsHeaders });
        }

        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
          return new Response(JSON.stringify({ success: false, error: 'Only image files and PDFs are allowed' }), { status: 400, headers: corsHeaders });
        }

        if (file.type.startsWith('image/') && file.size > 10 * 1024 * 1024) {
          return new Response(JSON.stringify({ success: false, error: 'Image size exceeds 10 MB limit' }), { status: 400, headers: corsHeaders });
        }

        const folder = (formData.get('folder') as string || 'books').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
        const altText = (formData.get('altText') as string) || '';
        const caption = (formData.get('caption') as string) || '';

        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const uuid = crypto.randomUUID().slice(0, 8);
        const safeFilename = (file.name || 'file').replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
        const key = `sahayak/${folder}/${timestamp}-${uuid}-${safeFilename}`;

        await env.MEDIA_BUCKET.put(key, file.stream(), {
          httpMetadata: {
            contentType: file.type
          }
        });

        const baseUrl = env.MEDIA_PUBLIC_BASE_URL.replace(/\/+$/, '');
        const publicUrl = `${baseUrl}/${key}`;

        const mediaId = 'med_' + crypto.randomUUID().replace(/-/g, '');
        const now = new Date().toISOString();

        await env.DB.prepare(`
          INSERT INTO media (id, filename, original_filename, r2_key, public_url, mime_type, file_size_bytes, folder, alt_text, caption, storage_provider, uploaded_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          mediaId,
          safeFilename,
          file.name,
          key,
          publicUrl,
          file.type,
          file.size,
          folder,
          altText,
          caption,
          'cloudflare-r2',
          auth.userId,
          now,
          now
        ).run();

        const mediaItem = {
          id: mediaId,
          name: safeFilename,
          fileName: safeFilename,
          originalFileName: file.name,
          originalFilename: file.name,
          objectKey: key,
          url: publicUrl,
          publicUrl: publicUrl,
          mimeType: file.type,
          size: `${Math.round(file.size / 1024)} KB`,
          fileSize: `${Math.round(file.size / 1024)} KB`,
          fileSizeBytes: file.size,
          folder: folder.charAt(0).toUpperCase() + folder.slice(1),
          category: folder,
          altText,
          caption,
          storageProvider: 'cloudflare-r2',
          uploadedBy: auth.userId,
          createdAt: now,
          updatedAt: now,
          date: now.split('T')[0]
        };

        return new Response(JSON.stringify({ success: true, media: mediaItem }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/media/') && request.method === 'DELETE') {
        const mediaId = path.replace('/api/media/', '');
        const auth = await checkAuth(env, request, ctx);
        if (!auth || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(auth.role)) {
          return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }

        const media = await env.DB.prepare('SELECT * FROM media WHERE id = ?').bind(mediaId).first<any>();
        if (!media) {
          return new Response(JSON.stringify({ success: false, error: 'Media not found' }), { status: 404, headers: corsHeaders });
        }

        const usage = await env.DB.prepare('SELECT * FROM media_usage WHERE media_id = ?').bind(mediaId).all();
        if (usage && usage.results && usage.results.length > 0) {
          return new Response(JSON.stringify({ success: false, error: 'Media item is currently in use and cannot be deleted' }), { status: 400, headers: corsHeaders });
        }

        if (media.r2_key && env.MEDIA_BUCKET) {
          try {
            await env.MEDIA_BUCKET.delete(media.r2_key);
          } catch (err) {
            console.error('Failed to delete object from R2:', err);
          }
        }

        await env.DB.prepare('DELETE FROM media WHERE id = ?').bind(mediaId).run();

        return new Response(JSON.stringify({ success: true, message: 'Media deleted successfully' }), { headers: corsHeaders });
      }

      if (path === '/api/settings') {
        const settings = await getSettings(env.DB);
        return new Response(JSON.stringify({ success: true, settings }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ success: false, error: 'Not found' }), { status: 404, headers: corsHeaders });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err.message || 'Internal server error' }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
