"use server";

import { headers } from "next/headers";
import { getOrderForTracking } from "@/features/orders/lib/orders";
import type { TrackState } from "@/features/orders/lib/track-state";

/**
 * Deliberately identical for every failure: wrong number, wrong phone, right
 * number with the wrong phone, or a number that was never issued. Anything
 * more specific turns /track into an oracle for whether an order exists.
 */
const NOT_FOUND =
  "No order matches that number and phone. Check both and try again.";

/**
 * Best-effort brute-force brake.
 *
 * Module scope, so it's per server instance and resets on redeploy — which is
 * exactly the tradeoff the zero-cost constraint buys: no Redis, no upstream
 * rate-limit service. It won't stop a distributed attacker, but it does stop
 * the realistic one (a script from one address walking the order-number
 * space), and requiring a matching phone number is the actual defence.
 */
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 12;
const attempts = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter(
    (stamp) => now - stamp < WINDOW_MS,
  );
  recent.push(now);
  attempts.set(key, recent);

  // Cheap sweep so the map can't grow without bound on a long-lived instance.
  if (attempts.size > 5_000) {
    for (const [id, stamps] of attempts) {
      if (stamps.every((stamp) => now - stamp >= WINDOW_MS))
        attempts.delete(id);
    }
  }

  return recent.length > MAX_ATTEMPTS;
}

async function clientKey(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Public order lookup. No session required — this is the guest tracking path,
 * and requiring an account here would be pointless when checkout doesn't.
 */
export async function lookupOrder(
  _prevState: TrackState,
  formData: FormData,
): Promise<TrackState> {
  const orderNumber =
    typeof formData.get("order") === "string"
      ? String(formData.get("order")).trim()
      : "";
  const phone =
    typeof formData.get("phone") === "string"
      ? String(formData.get("phone")).trim()
      : "";

  const values = { order: orderNumber, phone };

  if (!orderNumber || !phone) {
    return {
      searched: true,
      values,
      message: "Enter both your order number and the phone number you gave.",
    };
  }

  if (await rateLimited(await clientKey())) {
    return {
      searched: true,
      values,
      message: "Too many attempts. Please wait a minute and try again.",
    };
  }

  try {
    const order = await getOrderForTracking(orderNumber, phone);
    if (!order) return { searched: true, values, message: NOT_FOUND };

    return { searched: true, values, order };
  } catch (error) {
    console.error("lookupOrder failed", error);
    return {
      searched: true,
      values,
      message: "Something went wrong looking that up. Please try again.",
    };
  }
}
