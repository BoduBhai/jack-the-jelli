/**
 * A cart line reduced to the only two fields the server ever stores or reads.
 * The same pair the checkout hidden input submits — everything else about a
 * line is a display snapshot the server recomputes rather than trusts.
 */
export interface CartLineInput {
  productId: string;
  qty: number;
}

/**
 * What the server says about a line the browser is holding.
 *
 * Lives outside cart-actions.ts because a `"use server"` module is only meant
 * to export async functions, and outside cartStore.ts because that file is
 * `"use client"` — this shape has to be importable from both sides.
 */
export interface CartSnapshot {
  productId: string;
  name: string;
  slug: string;
  price: number;
  thumbnail?: string;
  stock: number;
  /** False when the product is no longer Published, or no longer exists. */
  available: boolean;
}

/** A line `placeOrder` refused, with enough detail for the cart to offer a fix. */
export interface UnavailableLine {
  productId: string;
  name: string;
  /** How many are actually left. 0 means sold out. */
  available: number;
  requested: number;
  reason: "sold-out" | "insufficient-stock" | "unpublished";
}
