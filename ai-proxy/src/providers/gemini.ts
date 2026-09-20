import type { AIProvider } from '../types';
export class GeminiProvider implements AIProvider {
  constructor(private readonly apiKey: string) {}
  async generate(instructions: string, prompt: string, model: string, signal: AbortSignal): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`, {
      method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: instructions }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) throw new Error(`PROVIDER_HTTP_${response.status}`);
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('');
    if (!text?.trim()) throw new Error('EMPTY_PROVIDER_RESPONSE');
    return text.trim();
  }
}
