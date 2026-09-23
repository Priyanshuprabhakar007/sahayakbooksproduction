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
}

// Helper to check authentication
async function checkAuth(env: Env, request: Request): Promise<{role: string, userId: string} | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const user = await env.DB.prepare('SELECT users.id, users.role FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.token_hash = ?').bind(token).first<{id: string, role: string}>();
  return user || null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = request.headers.get('Origin') || '*';

    // CORS configuration supporting ALLOWED_ORIGINS env variable
    let allowOrigin = '*';
    if (env.ALLOWED_ORIGINS) {
      const allowedList = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
      if (allowedList.includes(origin) || allowedList.includes('*')) {
        allowOrigin = origin;
      } else {
        allowOrigin = allowedList[0] || '*';
      }
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
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

      if (path === '/api/media/upload' && request.method === 'POST') {
        const auth = await checkAuth(env, request);
        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN')) {
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

        const publicUrl = `https://media.sahayakbooks.com/${key}`; // Placeholder URL
        const id = `med-${Date.now()}`;
        
        await env.DB.prepare('INSERT INTO media (id, filename, r2_key, public_url, mime_type, file_size_bytes, folder, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(
          id, file.name, key, publicUrl, file.type, file.size, folder, auth.userId, new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({ success: true, media: { id, filename: file.name, r2_key: key, public_url: publicUrl } }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/media/') && request.method === 'DELETE') {
        const auth = await checkAuth(env, request);
        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN')) {
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
