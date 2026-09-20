import OpenAI from 'openai';
import type { AIProvider, Env } from '../types';

export class OpenAIProvider implements AIProvider {
  constructor(private readonly apiKey: string) {}

  async generate(instructions: string, prompt: string, model: string, signal: AbortSignal): Promise<string> {
    const client = new OpenAI({ apiKey: this.apiKey });
    const response = await client.responses.create({
      model,
      instructions,
      input: prompt,
      store: false,
    }, { signal });

    if (!response.output_text?.trim()) throw new Error('EMPTY_PROVIDER_RESPONSE');
    return response.output_text.trim();
  }
}

export function getProvider(env: Env, providerName: string): AIProvider {
  if (providerName !== 'openai' || !env.OPENAI_API_KEY) throw new Error('PROVIDER_UNAVAILABLE');
  return new OpenAIProvider(env.OPENAI_API_KEY);
}
