import type { GenerateInput } from '../types';

export class ValidationError extends Error {}

export async function parseGenerateInput(request: Request, maxPromptChars: number): Promise<GenerateInput> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) throw new ValidationError('Content-Type debe ser application/json');

  let body: unknown;
  try { body = await request.json(); } catch { throw new ValidationError('El cuerpo debe ser JSON válido'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ValidationError('El cuerpo debe ser un objeto JSON');

  const { instructions, prompt, provider, model } = body as Record<string, unknown>;
  if (typeof instructions !== 'string' || !instructions.trim()) throw new ValidationError('El campo instructions es obligatorio');
  if (typeof prompt !== 'string' || !prompt.trim()) throw new ValidationError('El campo prompt es obligatorio');
  if (instructions.length > maxPromptChars || prompt.length > maxPromptChars) {
    throw new ValidationError(`instructions y prompt no pueden superar ${maxPromptChars} caracteres`);
  }
  if (provider !== undefined && typeof provider !== 'string') throw new ValidationError('provider no es válido');
  if (model !== undefined && typeof model !== 'string') throw new ValidationError('model no es válido');

  return { instructions: instructions.trim(), prompt: prompt.trim(), provider, model };
}
