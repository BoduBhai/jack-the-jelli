// The order state machine, in one place. Imported by the admin actions (which
// enforce it), the customer-facing pages (which label it), and models/Order.ts
// (which enumerates it) — so none of the three can drift from the others.
//
// Deliberately free of any server-only import: client components render from
// ORDER_STATUS_COPY, and pulling Mongoose in behind it would ship the driver to
// the browser.

export const ORDER_STATUSES = [
  "Draft",
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "collected", "failed"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * `Draft` is internal: an order is created as Draft to claim its
 * idempotencyKey, stock is decremented second, and only then does it flip to
 * Pending. It must be excluded from every customer- and admin-facing query —
 * ADMIN_VISIBLE_STATUSES below is what the admin list filters on.
 */
export const ALLOWED_NEXT: Record<OrderStatus, readonly OrderStatus[]> = {
  Draft: ["Pending", "Cancelled"],
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  // Terminal.
  Delivered: [],
  Cancelled: [],
};

/** Statuses an admin may move an order to by hand — Draft is never one. */
export const ADMIN_SETTABLE_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const satisfies readonly OrderStatus[];

export type AdminSettableStatus = (typeof ADMIN_SETTABLE_STATUSES)[number];

export const ADMIN_VISIBLE_STATUSES = ADMIN_SETTABLE_STATUSES;

/**
 * Which statuses may legally precede `to`.
 *
 * This is the whole point of the module: the transition is enforced by putting
 * `{status: {$in: predecessorsOf(to)}}` in the `findOneAndUpdate` *filter*, so
 * two concurrent admins can't both advance the same order. A
 * read-then-check-then-write in JavaScript would race.
 */
export function predecessorsOf(to: OrderStatus): OrderStatus[] {
  return ORDER_STATUSES.filter((from) => ALLOWED_NEXT[from].includes(to));
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_NEXT[from].includes(to);
}

export function isTerminal(status: OrderStatus): boolean {
  return ALLOWED_NEXT[status].length === 0;
}

/** Statuses that still hold decremented stock — cancelling one restores it. */
export const STOCK_COMMITTED_STATUSES = [
  "Draft",
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
] as const satisfies readonly OrderStatus[];

interface StatusCopy {
  /** Customer-facing name. "Pending" means nothing to a buyer. */
  label: string;
  /** One line of "where is my order" explanation for /track and /my-orders. */
  description: string;
}

export const ORDER_STATUS_COPY: Record<OrderStatus, StatusCopy> = {
  Draft: {
    label: "Order Placed",
    description: "Your order is being registered.",
  },
  Pending: {
    label: "Order Placed",
    description:
      "We have received your order and will call to confirm it shortly.",
  },
  Confirmed: {
    label: "Order Confirmed",
    description: "Confirmed over the phone. Your piece is being prepared.",
  },
  Shipped: {
    label: "In Transit",
    description: "Handed to the courier. Please keep the cash amount ready.",
  },
  Delivered: {
    label: "Delivered",
    description: "Delivered and payment collected.",
  },
  Cancelled: {
    label: "Cancelled",
    description: "This order was cancelled.",
  },
};

/**
 * The timeline shown on /track, oldest first. Cancelled is excluded because a
 * cancelled order stops the timeline rather than advancing through it.
 */
export const TRACKING_STEPS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
] as const satisfies readonly OrderStatus[];
