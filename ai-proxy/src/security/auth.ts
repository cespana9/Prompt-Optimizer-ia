function hex(bytes: ArrayBuffer): string { return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join(''); }
function equal(a: string, b: string): boolean { if (a.length !== b.length) return false; let value = 0; for (let i = 0; i < a.length; i++) value |= a.charCodeAt(i) ^ b.charCodeAt(i); return value === 0; }

export async function isAuthorized(request: Request, tokenHashes: string | undefined): Promise<boolean> {
  if (!tokenHashes) return false;
  const token = request.headers.get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token || token.length > 512) return false;
  const digest = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)));
  return tokenHashes.split(',').map((hash) => hash.trim().toLowerCase()).some((hash) => equal(hash, digest));
}
