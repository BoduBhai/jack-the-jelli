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
  predecessorsOf,
  type AdminSettableStatus,
  type OrderStatus,
} from "@/features/orders/lib/order-status";

/** Which timestamp each status stamps when it's reached. */
const STATUS_TIMESTAMP: Record<AdminSettableStatus, string> = {
  Pending: "placedAt",
  Confirmed: "confirmedAt",
  Shipped: "shippedAt",
  Delivered: "deliveredAt",
  Cancelled: "cancelledAt",
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

function revalidateOrder(orderNumber: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/my-orders");
}

/**
 * Advance an order along the state machine.
 *
 * The legal predecessors go in the **query filter**, not into a JavaScript
 * check: `findOneAndUpdate` with `{status: {$in: predecessorsOf(to)}}` reads
 * and writes as one atomic operation, so two admins clicking "Shipped" at the
 * same moment produce one transition and one history entry. A
 * read-then-check-then-write could not.
 *
 * Cancelling is routed to cancelOrder() because it also has to give the stock
 * back, which no other transition does.
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

  try {
    await connectDB();

    const at = new Date();
    const updated = await Order.findOneAndUpdate(
      { orderNumber, status: { $in: predecessorsOf(status) } },
      {
        $set: {
          status,
          [STATUS_TIMESTAMP[status]]: at,
          // Delivered is the moment the courier hands over the goods and takes
          // the cash — the two are the same event, so they're the same write.
          ...(status === "Delivered" ? { paymentStatus: "collected" } : {}),
        },
        $push: { statusHistory: { status, at } },
      },
      // `new` is deprecated in Mongoose 9 in favour of returnDocument.
      { returnDocument: "after" },
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
 * it was *before* the write, which is what lets paymentStatus depend on the
 * status being replaced in the same operation.
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
  const note =
    typeof formData.get("note") === "string"
      ? String(formData.get("note")).trim().slice(0, 200) || undefined
      : undefined;

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
            // Cancelled after it shipped means the courier came back with the
            // goods and no cash; anything earlier was never going to be paid.
            paymentStatus: {
              $cond: [{ $eq: ["$status", "Shipped"] }, "failed", "pending"],
            },
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
