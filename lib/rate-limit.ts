import { headers } from "next/headers";

/**
 * Best-effort brute-force / abuse brake for the public Server Actions.
 *
 * In-process by design: each limiter closes over its own Map, so counts are
 * per server instance and reset on redeploy — which is exactly the tradeoff
 * the zero-cost constraint buys. No Redis, no upstream rate-limit service. It
 * won't stop a distributed attacker, but it does stop the realistic one (a
 * script from one address), and it is never the only defence on a route.
 *
 * Lives here rather than in either action file because a `"use server"` module
 * may only export async functions.
 */
export function createRateLimiter({
  windowMs,
  max,
}: {
  windowMs: number;
  max: number;
}): (key: string) => boolean {
  const attempts = new Map<string, number[]>();

  /** Records this attempt, then reports whether the window is now exhausted. */
  return function rateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (attempts.get(key) ?? []).filter(
      (stamp) => now - stamp < windowMs,
    );
    recent.push(now);
    attempts.set(key, recent);

    // Cheap sweep so the map can't grow without bound on a long-lived instance.
    if (attempts.size > 5_000) {
      for (const [id, stamps] of attempts) {
        if (stamps.every((stamp) => now - stamp >= windowMs))
          attempts.delete(id);
      }
    }

    return recent.length > max;
  };
}

/**
 * The bucket a request is counted against. Behind no proxy (local dev) every
 * caller collapses into "unknown" and shares one bucket — acceptable for a
 * best-effort brake.
 */
export async function clientKey(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}
