import type { AIProvider } from '../types';

/** Adapter for server-configured OpenAI-compatible APIs. The client never controls baseUrl. */
export class CompatibleProvider implements AIProvider {
  constructor(private readonly baseUrl: string, private readonly apiKey?: string) {}
  async generate(instructions: string, prompt: string, model: string, signal: AbortSignal): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST', signal,
      headers: { ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}), 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: instructions }, { role: 'user', content: prompt }] }),
    });
    if (!response.ok) throw new Error(`PROVIDER_HTTP_${response.status}`);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content;
    if (!text?.trim()) throw new Error('EMPTY_PROVIDER_RESPONSE');
    return text.trim();
  }
}
