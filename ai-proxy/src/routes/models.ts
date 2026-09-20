import { getConfig } from '../config';
import { isProviderConfigured, PROVIDER_LABELS } from '../providers/registry';
import type { Env } from '../types';
export function models(env: Env): Response {
  const config = getConfig(env);
  return Response.json({ models: [...config.allowedProviders].map((id) => ({ id, name: PROVIDER_LABELS[id] ?? id, available: isProviderConfigured(env, id), models: config.providerModels[id] ?? [] })) }, { headers: { 'Cache-Control': 'no-store' } });
}
