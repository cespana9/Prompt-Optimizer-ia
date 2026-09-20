import { GeminiProvider } from './gemini';
import { CompatibleProvider } from './compatible';
import { getProvider as getOpenAIProvider } from './openai';
import type { AIProvider, Env } from '../types';

export const PROVIDER_LABELS: Record<string, string> = { openai: 'OpenAI', opencode: 'OpenCode Inference', gemini: 'Gemini', openrouter: 'OpenRouter', nvidia: 'NVIDIA', mimo: 'MiMo', deepseek: 'DeepSeek' };

export function getProvider(env: Env, name: string): AIProvider {
  if (name === 'openai') return getOpenAIProvider(env, name);
  if (name === 'gemini' && env.GEMINI_API_KEY) return new GeminiProvider(env.GEMINI_API_KEY);
  if (name === 'opencode' && env.AI_BASE_URL) return new CompatibleProvider(`${env.AI_BASE_URL.replace(/\/$/, '')}/chat/completions`, env.AI_API_KEY);
  const compatible: Record<string, [string | undefined, string | undefined]> = {
    openrouter: [env.OPENROUTER_API_KEY, 'https://openrouter.ai/api/v1/chat/completions'],
    nvidia: [env.NVIDIA_API_KEY, 'https://integrate.api.nvidia.com/v1/chat/completions'],
    deepseek: [env.DEEPSEEK_API_KEY, 'https://api.deepseek.com/chat/completions'],
    mimo: [env.MIMO_API_KEY, env.MIMO_BASE_URL],
  };
  const entry = compatible[name];
  if (entry?.[0] && entry[1]) return new CompatibleProvider(entry[1], entry[0]);
  throw new Error('PROVIDER_UNAVAILABLE');
}

export function isProviderConfigured(env: Env, name: string): boolean {
  try { getProvider(env, name); return true; } catch { return false; }
}
