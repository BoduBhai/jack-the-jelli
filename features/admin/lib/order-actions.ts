"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { connectDB } from "@/lib/db";
import { Order, Product, type IOrderItem } from "@/models";
import type { AdminFormState } from "@/features/admin/lib/form-state";
import { STALE_DRAFT_MINUTES } from "@/features/admin/lib/orders";
import { ORDER_NUMBER_PATTERN } from "@/features/orders/lib/order-number";
import {
  ADMIN_SETTABLE_STATUSES,
  PAYMENT_STATUS_COPY,
  PAYMENT_STATUSES,
  predecessorsOf,
  type AdminSettableStatus,
  type OrderStatus,
} from "@/features/orders/lib/order-status";

/** Which timestamp each status stamps the first time it's reached. */
const STATUS_TIMESTAMP: Record<AdminSettableStatus, string> = {
  Pending: "placedAt",
  Confirmed: "confirmedAt",
  Shipped: "shippedAt",
  Delivered: "deliveredAt",
  Cancelled: "cancelledAt",
  Returned: "returnedAt",
};

const statusInputSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(ORDER_NUMBER_PATTERN, "Unknown order"),
  status: z.enum(ADMIN_SETTABLE_STATUSES),
});

const orderNumberSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(ORDER_NUMBER_PATTERN, "Unknown order"),
});

const paymentInputSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(ORDER_NUMBER_PATTERN, "Unknown order"),
  paymentStatus: z.enum(PAYMENT_STATUSES),
});

function revalidateOrder(orderNumber: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/my-orders");
}

/** The optional operator note carried by the cancel and return dialogs. */
function readNote(formData: FormData): string | undefined {
  const raw = formData.get("note");
  if (typeof raw !== "string") return undefined;
  return raw.trim().slice(0, 200) || undefined;
}

/**
 * Move an order to another status.
 *
 * The legal predecessors go in the **query filter**, not into a JavaScript
 * check: `findOneAndUpdate` with `{status: {$in: predecessorsOf(to)}}` reads
 * and writes as one atomic operation, so two admins clicking "Shipped" at the
 * same moment produce one transition and one history entry. A
 * read-then-check-then-write could not. That still holds now the table admits
 * backward edges — the filter just matches a wider set.
 *
 * Cancelling and returning are routed away because each also has to settle the
 * stock, which no ordinary move does.
 */
export async function updateOrderStatus(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = statusInputSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { ok: false, message: "That status change isn't valid." };
  }

  const { orderNumber, status } = parsed.data;
  if (status === "Cancelled") return cancelOrder(_prevState, formData);
  if (status === "Returned") return returnOrder(_prevState, formData);

  try {
    await connectDB();

    const at = new Date();
    const stamp = STATUS_TIMESTAMP[status];
    const updated = await Order.findOneAndUpdate(
      { orderNumber, status: { $in: predecessorsOf(status) } },
      // A pipeline rather than a plain update, so the milestone timestamp can
      // depend on its own current value. Payment is untouched on purpose: it's
      // set by hand now, and Delivered no longer implies collected.
      [
        {
          $set: {
            status,
            // First reach wins. Statuses move backwards to undo a mis-click,
            // and re-entering a stage must not rewrite when the order
            // originally got there — statusHistory keeps the full trail.
            [stamp]: { $ifNull: [`$${stamp}`, at] },
            statusHistory: {
              $concatArrays: [
                { $ifNull: ["$statusHistory", []] },
                [{ status, at }],
              ],
            },
          },
        },
      ],
      // `new` is deprecated in Mongoose 9 in favour of returnDocument, and
      // Mongoose 9 refuses an array update unless updatePipeline is declared.
      { returnDocument: "after", updatePipeline: true },
    )
      .select("status")
      .lean<{ status: OrderStatus } | null>();

    if (!updated) {
      // Either the order is gone, or it's somewhere this status can't be
      // reached from — a Delivered order rejecting a further change, say.
      const current = await Order.findOne({ orderNumber })
        .select("status")
        .lean<{ status: OrderStatus } | null>();

      return {
        ok: false,
        message: current
          ? `This order is ${current.status} — it can't be moved to ${status}.`
          : "That order no longer exists.",
      };
    }
  } catch (error) {
    console.error("updateOrderStatus failed", error);
    return { ok: false, message: "Something went wrong updating this order." };
  }

  revalidateOrder(orderNumber);
  return { ok: true, message: `Order marked ${status}.` };
}

/**
 * Cancel an order and return its stock — exactly once.
 *
 * `stockRestoredAt: null` is in the filter, so of two concurrent cancels only
 * one can match and only one restores. The status update itself is an
 * aggregation-pipeline update: every expression inside it sees the document as
 * it was *before* the write, which is what lets statusHistory be appended to
 * in the same operation that replaces the status.
 *
 * Cancelling says nothing about the money — see updatePaymentStatus.
 */
export async function cancelOrder(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = orderNumberSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
  });
  if (!parsed.success) {
    return { ok: false, message: "That order no longer exists." };
  }

  const { orderNumber } = parsed.data;
  const note = readNote(formData);

  try {
    await connectDB();

    const at = new Date();
    // The pre-update document is the one that still carries the items to
    // restore and the status that decides the payment outcome.
    const previous = await Order.findOneAndUpdate(
      {
        orderNumber,
        status: { $in: predecessorsOf("Cancelled") },
        stockRestoredAt: null,
      },
      [
        {
          $set: {
            status: "Cancelled",
            cancelledAt: at,
            stockRestoredAt: at,
            // paymentStatus is deliberately not written. Whether the courier
            // came back with cash is the operator's call, not something to
            // infer from the status this order happened to die in.
            statusHistory: {
              $concatArrays: [
                { $ifNull: ["$statusHistory", []] },
                [{ status: "Cancelled", at, ...(note ? { note } : {}) }],
              ],
            },
          },
        },
      ],
      // Mongoose 9 refuses an array update unless the pipeline is declared
      // explicitly — without this it throws rather than running the update.
      { returnDocument: "before", updatePipeline: true },
    ).lean<{ items: IOrderItem[]; status: OrderStatus } | null>();

    if (!previous) {
      const current = await Order.findOne({ orderNumber })
        .select("status stockRestoredAt")
        .lean<{ status: OrderStatus; stockRestoredAt?: Date } | null>();

      if (!current)
        return { ok: false, message: "That order no longer exists." };
      // The common case by far: someone already cancelled it. Refusing here is
      // what stops the stock being restored a second time.
      return {
        ok: false,
        message:
          current.status === "Cancelled"
            ? "This order is already cancelled."
            : `A ${current.status} order can't be cancelled.`,
      };
    }

    // Only reached by the single caller that won the filter above.
    if (previous.items.length > 0) {
      await Product.bulkWrite(
        previous.items.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { stock: item.qty } },
          },
        })),
      );
    }
  } catch (error) {
    console.error("cancelOrder failed", error);
    return {
      ok: false,
      message: "Something went wrong cancelling this order.",
    };
  }

  revalidateOrder(orderNumber);
  revalidatePath("/collection");
  return { ok: true, message: "Order cancelled and stock returned." };
}

/**
 * Close an order that came back — from the courier, or from the customer after
 * delivery.
 *
 * Whether the goods rejoin sellable stock is the caller's decision, not a rule:
 * a piece returned because it was defective belongs in the workshop, while one
 * returned because the customer changed their mind belongs back on the shelf.
 * That's the whole reason this isn't just a Cancelled with a note — cancelling
 * always restocks.
 *
 * The restock branch reuses cancelOrder's exactly-once guarantee, by putting
 * `stockRestoredAt: null` in the filter. A return that *doesn't* restock must
 * leave that guard unclaimed, since its units stay committed.
 */
export async function returnOrder(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = orderNumberSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
  });
  if (!parsed.success) {
    return { ok: false, message: "That order no longer exists." };
  }

  const { orderNumber } = parsed.data;
  const note = readNote(formData);
  const restock = formData.get("restock") === "on";

  try {
    await connectDB();

    const at = new Date();
    // The pre-update document still carries the items to restore.
    const previous = await Order.findOneAndUpdate(
      {
        orderNumber,
        status: { $in: predecessorsOf("Returned") },
        ...(restock ? { stockRestoredAt: null } : {}),
      },
      [
        {
          $set: {
            status: "Returned",
            returnedAt: at,
            ...(restock ? { stockRestoredAt: at } : {}),
            statusHistory: {
              $concatArrays: [
                { $ifNull: ["$statusHistory", []] },
                [{ status: "Returned", at, ...(note ? { note } : {}) }],
              ],
            },
          },
        },
      ],
      { returnDocument: "before", updatePipeline: true },
    ).lean<{ items: IOrderItem[]; status: OrderStatus } | null>();

    if (!previous) {
      const current = await Order.findOne({ orderNumber })
        .select("status")
        .lean<{ status: OrderStatus } | null>();

      if (!current)
        return { ok: false, message: "That order no longer exists." };
      return {
        ok: false,
        message:
          current.status === "Returned"
            ? "This order is already marked returned."
            : `A ${current.status} order can't be returned — only a shipped or delivered one can.`,
      };
    }

    // Only reached by the single caller that won the filter above.
    if (restock && previous.items.length > 0) {
      await Product.bulkWrite(
        previous.items.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { stock: item.qty } },
          },
        })),
      );
    }
  } catch (error) {
    console.error("returnOrder failed", error);
    return { ok: false, message: "Something went wrong returning this order." };
  }

  revalidateOrder(orderNumber);
  if (restock) revalidatePath("/collection");
  return {
    ok: true,
    message: restock
      ? "Order returned and stock restored."
      : "Order returned. Stock left unchanged.",
  };
}

/**
 * Set the payment outcome by hand.
 *
 * Deliberately free of any state machine. Cash on delivery doesn't settle on a
 * schedule the order status can predict — a courier can hand over the goods and
 * come back short, and a refund happens days after Delivered — so any value is
 * reachable at any time, and nothing else in this file writes the field.
 */
export async function updatePaymentStatus(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = paymentInputSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    paymentStatus: formData.get("paymentStatus"),
  });
  if (!parsed.success) {
    return { ok: false, message: "That payment status isn't valid." };
  }

  const { orderNumber, paymentStatus } = parsed.data;

  try {
    await connectDB();

    // Draft is the in-flight stock claim, not an order anyone collects on.
    const result = await Order.updateOne(
      { orderNumber, status: { $ne: "Draft" } },
      { $set: { paymentStatus, paymentUpdatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return { ok: false, message: "That order no longer exists." };
    }
  } catch (error) {
    console.error("updatePaymentStatus failed", error);
    return { ok: false, message: "Something went wrong updating this order." };
  }

  revalidateOrder(orderNumber);
  return {
    ok: true,
    message: `Payment marked "${PAYMENT_STATUS_COPY[paymentStatus].admin}".`,
  };
}

/**
 * Release stock held by Drafts that never became orders.
 *
 * A Draft is created before stock is decremented and flipped to Pending after,
 * so a crash in that window leaves one holding units for an order nobody
 * placed. This is the sweep — run by hand from the orders screen rather than
 * by a cron service, which is the whole reason it costs nothing.
 *
 * A Draft that predates its own decrement holds nothing, hence the
 * `stockCommittedAt` check before anything is given back.
 */
export async function releaseStaleDrafts(): Promise<AdminFormState> {
  await requireAdmin();

  let released = 0;

  try {
    await connectDB();

    const staleBefore = new Date(Date.now() - STALE_DRAFT_MINUTES * 60_000);
    const drafts = await Order.find({
      status: "Draft",
      createdAt: { $lt: staleBefore },
      stockRestoredAt: null,
    })
      .select("orderNumber idempotencyKey items stockCommittedAt")
      .lean<
        {
          orderNumber: string;
          idempotencyKey: string;
          items: IOrderItem[];
          stockCommittedAt?: Date;
        }[]
      >();

    for (const draft of drafts) {
      const at = new Date();
      // Same single-restore guarantee as cancelOrder: the filter, not a check.
      const claimed = await Order.updateOne(
        {
          orderNumber: draft.orderNumber,
          status: "Draft",
          stockRestoredAt: null,
        },
        {
          $set: {
            status: "Cancelled",
            cancelledAt: at,
            stockRestoredAt: at,
            paymentStatus: "failed",
            // Same release as the checkout rollback: this draft never became
            // an order, so the customer's browser must be able to retry the
            // identical cart under the key it is still holding.
            idempotencyKey: `${draft.idempotencyKey}:void:${draft.orderNumber}`,
          },
          $push: {
            statusHistory: {
              status: "Cancelled",
              at,
              note: "Abandoned draft released by sweep",
            },
          },
        },
      );

      if (claimed.modifiedCount !== 1) continue;
      released += 1;

      if (draft.stockCommittedAt && draft.items.length > 0) {
        await Product.bulkWrite(
          draft.items.map((item) => ({
            updateOne: {
              filter: { _id: item.product },
              update: { $inc: { stock: item.qty } },
            },
          })),
        );
      }
    }
  } catch (error) {
    console.error("releaseStaleDrafts failed", error);
    return { ok: false, message: "Could not release the held drafts." };
  }

  revalidatePath("/admin");
  revalidatePath("/collection");
  return {
    ok: true,
    message:
      released === 0
        ? "Nothing to release."
        : `Released ${released} abandoned draft${released === 1 ? "" : "s"}.`,
  };
}
