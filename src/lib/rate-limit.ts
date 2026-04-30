// Simple in-memory rate limiter.
// Limitation: state is per-serverless-instance. On Vercel with multiple concurrent
// instances a burst can exceed the limit. For production scale, replace with
// @upstash/ratelimit + Redis — the call signature is identical.
const store = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true, remaining: limit - timestamps.length };
}
