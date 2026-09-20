import { createServer } from 'node:http';
import { config } from 'dotenv';
import app from './index';
import type { Env } from './types';

config({ path: '.dev.vars' });
const port = Number(process.env.PORT ?? 8787);
const env = process.env as unknown as Env;
createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const request = new Request(`http://${req.headers.host ?? `localhost:${port}`}${req.url ?? '/'}`, {
    method: req.method, headers: req.headers as HeadersInit,
    body: ['GET', 'HEAD'].includes(req.method ?? '') ? undefined : Buffer.concat(chunks),
  });
  const response = await app.fetch(request, env);
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => { headers[key] = value; });
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
}).listen(port, () => console.log(`Proxy local activo en http://localhost:${port}`));
