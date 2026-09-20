export function corsHeaders(origin: string | null, allowedOrigins: Set<string>): HeadersInit {
  if (!origin || !allowedOrigins.has(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Installation-Id, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function isAllowedOrigin(origin: string | null, allowedOrigins: Set<string>): boolean {
  return Boolean(origin && allowedOrigins.has(origin));
}
