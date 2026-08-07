import type { UnavailableLine } from "@/features/cart/lib/types";

/**
 * Return shape for `placeOrder`, so `useActionState` can render field errors
 * and refill the form after a failed submit.
 *
 * Mirrors AdminFormState (features/admin/lib/form-state.ts) with one addition:
 * `unavailable`, which the summary uses to point at the exact lines that
 * blocked the order. Lives outside the action file because a `"use server"`
 * module may only export async functions.
 */
export interface CheckoutFormState {
  ok: boolean;
  /** Keyed by form field name. */
  errors?: Record<string, string>;
  /** Raw submitted strings, echoed back so nothing typed gets wiped. */
  values?: Record<string, string>;
  /** Form-level message (unexpected failure, or a summary). */
  message?: string;
  /**
   * Set when the order was refused because stock moved underneath it. Orders
   * are all-or-nothing — nothing was charged, nothing was decremented.
   */
  unavailable?: UnavailableLine[];
}

export const emptyCheckoutState: CheckoutFormState = { ok: false };
