interface RateLimitState { count: number; resetAt: number; }
const buckets = new Map<string, RateLimitState>();

/** Local-only limiter. It resets when the Node process stops. */
export function enforceRateLimit(identity: string, limit: number): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const current = buckets.get(identity);
  const resetAt = current && current.resetAt > now ? current.resetAt : now + 86_400_000;
  const count = current && current.resetAt > now ? current.count + 1 : 1;
  buckets.set(identity, { count, resetAt });
  return { allowed: count <= limit, retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)) };
}
