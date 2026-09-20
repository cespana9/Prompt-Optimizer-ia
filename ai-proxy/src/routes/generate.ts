import { getConfig } from '../config';
import { getProvider } from '../providers/registry';
import { isAuthorized } from '../security/auth';
import { corsHeaders, isAllowedOrigin } from '../security/cors';
import { enforceRateLimit } from '../security/rate-limit';
import { parseGenerateInput, ValidationError } from '../security/validation';
import type { Env } from '../types';

function json(body: object, status: number, headers: HeadersInit = {}): Response {
  return Response.json(body, { status, headers: { ...headers, 'Cache-Control': 'no-store' } });
}

function requestIdentity(request: Request): string {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const installationId = request.headers.get('X-Installation-Id') ?? 'anonymous';
  // The IP makes this more resistant to arbitrary client-generated installation IDs.
  return `${ip}:${installationId.slice(0, 128)}`;
}

export async function generate(request: Request, env: Env): Promise<Response> {
  const config = getConfig(env);
  const origin = request.headers.get('Origin');
  const headers = corsHeaders(origin, config.allowedOrigins);

  if (!isAllowedOrigin(origin, config.allowedOrigins)) return json({ error: 'Origen no autorizado' }, 401);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (!await isAuthorized(request, env.CLIENT_TOKEN_HASHES)) return json({ error: 'No autorizado' }, 401, headers);

  try {
    const rateLimit = enforceRateLimit(requestIdentity(request), config.rateLimitPerDay);
    if (!rateLimit.allowed) return json({ error: 'Demasiadas peticiones' }, 429, { ...headers, 'Retry-After': String(rateLimit.retryAfter) });

    const input = await parseGenerateInput(request, config.maxPromptChars);
    const providerName = input.provider ?? config.defaultProvider;
    const model = input.model ?? config.defaultModel;
    if (!config.allowedProviders.has(providerName) || !config.providerModels[providerName]?.includes(model)) {
      return json({ error: 'Proveedor o modelo no permitido' }, 400, headers);
    }

    const result = await getProvider(env, providerName).generate(
      input.instructions,
      input.prompt,
      model,
      AbortSignal.timeout(config.timeoutMs),
    );
    return json({ result }, 200, headers);
  } catch (error) {
    if (error instanceof ValidationError) return json({ error: error.message }, 400, headers);
    if (error instanceof DOMException && error.name === 'TimeoutError') return json({ error: 'El proveedor tardó demasiado en responder' }, 502, headers);
    if (error instanceof Error && error.message === 'PROVIDER_UNAVAILABLE') return json({ error: 'El proveedor de IA no está configurado' }, 502, headers);
    if (error instanceof Error && (error.message.startsWith('PROVIDER_HTTP_') || error.message === 'EMPTY_PROVIDER_RESPONSE')) {
      const status = error.message.replace('PROVIDER_HTTP_', '');
      console.warn(JSON.stringify({ event: 'provider_error', status: status || 'empty_response' }));
      return json({ error: 'OpenCode rechazó la solicitud. Revisa el modelo, el token o la cuota.' }, 502, headers);
    }
    // Do not expose SDK errors, provider responses, stack traces, prompts or credentials.
    return json({ error: 'Error interno del proxy' }, 500, headers);
  }
}
