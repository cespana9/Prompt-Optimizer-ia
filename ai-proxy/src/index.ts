import { generate } from './routes/generate';
import { health } from './routes/health';
import { models } from './routes/models';
import type { Env } from './types';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/health' && request.method === 'GET') return health();
    if (url.pathname === '/api/models' && request.method === 'GET') return models(env);
    if (url.pathname === '/api/generate' && ['POST', 'OPTIONS'].includes(request.method)) return generate(request, env);
    return Response.json({ error: 'No encontrado' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  },
};
