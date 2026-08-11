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
  let nextSweep = Date.now() + windowMs;

  /**
   * Reports whether this key has already spent its window, recording the
   * attempt only when it is let through. Not recording rejections is what
   * makes the "wait a minute" copy true: a blocked caller recovers a window
   * after their last *accepted* attempt rather than their last retry, so a
   * customer refreshing checkout — or anyone sharing one carrier-grade-NAT
   * address with them — can't hold themselves locked out. It also caps each
   * key at `max` timestamps, so a script can't make the limiter more
   * expensive by hammering it harder.
   */
  return function rateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (attempts.get(key) ?? []).filter(
      (stamp) => now - stamp < windowMs,
    );
    const allowed = recent.length < max;
    if (allowed) recent.push(now);
    attempts.set(key, recent);

    // Sweep on a cadence rather than on map size: a size threshold that stays
    // exceeded turns every request into a full scan that frees nothing. Runs
    // after this key is recorded, so the entry just written is never the one
    // collected.
    if (now >= nextSweep) {
      nextSweep = now + windowMs;
      for (const [id, stamps] of attempts) {
        if (stamps.every((stamp) => now - stamp >= windowMs))
          attempts.delete(id);
      }
    }

    return !allowed;
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
