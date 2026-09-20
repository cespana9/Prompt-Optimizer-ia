import { describe, expect, it } from 'vitest';
import { parseGenerateInput, ValidationError } from '../src/security/validation';

describe('parseGenerateInput', () => {
  it('acepta una entrada válida', async () => {
    const request = new Request('https://example.test/api/generate', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instructions: 'Organiza Markdown', prompt: 'Haz una lista' }),
    });
    await expect(parseGenerateInput(request, 100)).resolves.toMatchObject({ prompt: 'Haz una lista' });
  });

  it('rechaza prompt vacío', async () => {
    const request = new Request('https://example.test', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instructions: 'x', prompt: ' ' }),
    });
    await expect(parseGenerateInput(request, 100)).rejects.toBeInstanceOf(ValidationError);
  });

  it('rechaza valores que superan el límite', async () => {
    const request = new Request('https://example.test', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instructions: 'x', prompt: 'demasiado largo' }),
    });
    await expect(parseGenerateInput(request, 5)).rejects.toBeInstanceOf(ValidationError);
  });
});
