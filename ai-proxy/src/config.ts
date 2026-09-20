import type { Env } from './types';

const DEFAULT_MAX_PROMPT_CHARS = 12_000;
const DEFAULT_TIMEOUT_MS = 25_000;
const DEFAULT_RATE_LIMIT = 100;
const DEFAULT_MODEL = 'gpt-6-astra';

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getConfig(env: Env) {
  const defaultModel = env.DEFAULT_MODEL || DEFAULT_MODEL;
  const defaultProvider = env.DEFAULT_PROVIDER || 'openai';
  let providerModels: Record<string, string[]> = { [defaultProvider]: [defaultModel] };
  try { providerModels = { ...providerModels, ...JSON.parse(env.PROVIDER_MODELS ?? '{}') }; } catch { /* safe fallback */ }
  return {
    allowedOrigins: new Set(
      (env.ALLOWED_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
    defaultModel,
    defaultProvider,
    maxPromptChars: positiveInteger(env.MAX_PROMPT_CHARS, DEFAULT_MAX_PROMPT_CHARS),
    timeoutMs: positiveInteger(env.REQUEST_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    rateLimitPerDay: positiveInteger(env.RATE_LIMIT_PER_DAY, DEFAULT_RATE_LIMIT),
    // The client can select only these values. Add future providers here, never URLs.
    allowedProviders: new Set(Object.keys(providerModels)),
    allowedModels: new Set(Object.values(providerModels).flat()),
    providerModels,
  };
}
