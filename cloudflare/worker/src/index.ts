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
  
  return user;
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
        const { email, password, rememberMe } = await request.json<{email: string, password: string, rememberMe?: boolean}>();
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
        if (!auth) return new Response(JSON.stringify({ success: false }), { status: 401, headers: corsHeaders });
        const user = await env.DB.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').bind(auth.userId).first();
        return new Response(JSON.stringify({ success: true, user }), { headers: corsHeaders });
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

      if (path === '/api/auth/login' && request.method === 'POST') {
        // Implementation for PBKDF2 password verification and session creation
        return new Response(JSON.stringify({ success: false, error: 'Not implemented yet' }), { status: 501, headers: corsHeaders });
      }

      if (path === '/api/auth/me' && request.method === 'GET') {
        const auth = await checkAuth(env, request);
        return new Response(JSON.stringify({ success: !!auth, user: auth }), { headers: corsHeaders });
      }

      if (path === '/api/auth/logout' && request.method === 'POST') {
        // Implementation for session deletion
        return new Response(JSON.stringify({ success: false, error: 'Not implemented yet' }), { status: 501, headers: corsHeaders });
      }

      if (path === '/api/media/upload' && request.method === 'POST') {
        const auth = await checkAuth(env, request, ctx);
        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN' && auth.role !== 'EDITOR')) {
          return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }
        
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) return new Response(JSON.stringify({ success: false, error: 'No file uploaded' }), { status: 400, headers: corsHeaders });

        const folder = formData.get('folder') as string || 'misc';
        const key = `${folder}/${crypto.randomUUID()}-${file.name}`;
        
        await env.MEDIA_BUCKET.put(key, file.stream(), {
          httpMetadata: { contentType: file.type }
        });

        if (!env.MEDIA_PUBLIC_BASE_URL) {
          return new Response(JSON.stringify({ success: false, error: 'MEDIA_PUBLIC_BASE_URL not configured' }), { status: 500, headers: corsHeaders });
        }
        
        const publicUrl = `${env.MEDIA_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
        const id = `med-${Date.now()}`;
        
        await env.DB.prepare('INSERT INTO media (id, filename, r2_key, public_url, mime_type, file_size_bytes, folder, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(
          id, file.name, key, publicUrl, file.type, file.size, folder, auth.userId, new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({ success: true, media: { id, filename: file.name, r2_key: key, public_url: publicUrl } }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/media/') && request.method === 'DELETE') {
        const auth = await checkAuth(env, request, ctx);
        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN' && auth.role !== 'EDITOR')) {
          return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }
        
        const id = path.replace('/api/media/', '');
        const media = await env.DB.prepare('SELECT r2_key FROM media WHERE id = ?').bind(id).first<{r2_key: string}>();
        if (!media) return new Response(JSON.stringify({ success: false, error: 'Media not found' }), { status: 404, headers: corsHeaders });

        const usage = await env.DB.prepare('SELECT count(*) as count FROM media_usage WHERE media_id = ?').bind(id).first<{count: number}>();
        if (usage && usage.count > 0) return new Response(JSON.stringify({ success: false, error: 'Media in use' }), { status: 409, headers: corsHeaders });

        await env.MEDIA_BUCKET.delete(media.r2_key);
        await env.DB.prepare('DELETE FROM media WHERE id = ?').bind(id).run();
        
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
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
