/**
 * The two numbers that bound a cart, in a module with no `"use client"` or
 * `"use server"` directive so every side can import them.
 *
 * They were previously declared three times — cartStore.ts, cart-actions.ts and
 * checkout-schema.ts, the last under a comment noting the duplication — which
 * meant raising a limit in one place silently left the others enforcing the old
 * one. The Mongoose schema in models/Cart.ts is what forced the issue: a server
 * model must not import a constant out of a `"use client"` module.
 */

/** Guards against a fat-fingered stepper more than against inventory. */
export const MAX_LINE_QTY = 20;

/** A cart bigger than this is a script, not a shopper. */
export const MAX_CART_LINES = 50;
