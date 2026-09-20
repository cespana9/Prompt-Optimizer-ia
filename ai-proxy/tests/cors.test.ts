import { describe, expect, it } from 'vitest';
import { corsHeaders, isAllowedOrigin } from '../src/security/cors';

describe('CORS restringido', () => {
  const allowlist = new Set(['chrome-extension://abcdefghijklmnopabcdefghijklmnop']);

  it('autoriza exclusivamente el origen configurado', () => {
    expect(isAllowedOrigin('chrome-extension://abcdefghijklmnopabcdefghijklmnop', allowlist)).toBe(true);
    expect(isAllowedOrigin('https://attacker.example', allowlist)).toBe(false);
  });

  it('no devuelve cabeceras para un origen externo', () => {
    expect(corsHeaders('https://attacker.example', allowlist)).toEqual({});
  });
});
