"use client";

import { RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FulfillmentBadge from "@/features/admin/components/FulfillmentBadge";
import OrderSettleDialog from "@/features/admin/components/OrderSettleDialog";
import StatusButtonRow from "@/features/admin/components/StatusButtonRow";
import {
  cancelOrder,
  returnOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/features/admin/lib/order-actions";
import {
  ALLOWED_NEXT,
  LIVE_STATUSES,
  PAYMENT_STATUS_COPY,
  PAYMENT_STATUSES,
  isTerminal,
} from "@/features/orders/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/features/admin/lib/types";

const DELIVERY_OPTIONS = LIVE_STATUSES.map((status) => ({
  value: status,
  label: status,
}));

const PAYMENT_OPTIONS = PAYMENT_STATUSES.map((status) => ({
  value: status,
  label: PAYMENT_STATUS_COPY[status].admin,
}));

/** Where a return is a plausible thing to have happened. */
const RETURNABLE: readonly OrderStatus[] = ["Shipped", "Delivered"];

/**
 * The only place an order's status can be changed.
 *
 * Delivery shows all four live stages at once and moves between them in either
 * direction, because the common admin need is fixing a mis-click, not marching
 * an order forward one step at a time. `ALLOWED_NEXT` still decides what's
 * offered — the same table the Server Action enforces through its query filter.
 *
 * Payment is a separate, unconstrained row. Nothing derives it from delivery
 * any more: cash on delivery doesn't settle on a schedule the status can
 * predict, so the operator says when it did.
 */
export default function OrderStatusControls({
  orderNumber,
  status,
  paymentStatus,
  unitCount,
}: {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  /** Units on the order — what a restocking return would give back. */
  unitCount: number;
}) {
  const terminal = isTerminal(status);
  const nextStatuses = ALLOWED_NEXT[status];

  return (
    <div className="space-y-4">
      {terminal ? (
        <div className="border-border space-y-2 border p-4">
          <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
            Delivery Status
          </p>
          <FulfillmentBadge status={status} />
          <p className="text-muted-foreground/60 text-xs">
            {status === "Returned"
              ? "This order came back and is closed. Payment can still be settled below."
              : "Cancelled orders are final. Their stock has already been returned."}
          </p>
        </div>
      ) : (
        <StatusButtonRow
          label="Delivery Status"
          field="status"
          orderNumber={orderNumber}
          options={DELIVERY_OPTIONS}
          current={status}
          action={updateOrderStatus}
          isDisabled={(value) => !nextStatuses.includes(value as OrderStatus)}
        />
      )}

      <StatusButtonRow
        label="Payment Status"
        field="paymentStatus"
        orderNumber={orderNumber}
        options={PAYMENT_OPTIONS}
        current={paymentStatus}
        action={updatePaymentStatus}
        hint="Set by hand — delivering an order no longer marks it collected."
      />

      {!terminal && (
        <div className="flex flex-wrap gap-2">
          {RETURNABLE.includes(status) && (
            <OrderSettleDialog
              orderNumber={orderNumber}
              action={returnOrder}
              title="Mark this order returned?"
              description="For a piece that came back to us. This closes the order for good."
              confirmLabel="Mark returned"
              notePlaceholder="Defective stitching"
              trigger={
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none tracking-wider uppercase"
                >
                  <RotateCcw className="size-3.5" />
                  Mark returned
                </Button>
              }
              extraFields={
                <label className="border-border flex cursor-pointer items-start gap-3 border p-3">
                  <input
                    type="checkbox"
                    name="restock"
                    className="accent-foreground mt-0.5 size-4 shrink-0 rounded-none"
                  />
                  <span>
                    <span className="text-foreground block text-sm">
                      Return {unitCount} unit{unitCount === 1 ? "" : "s"} to
                      sellable stock
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs">
                      Leave this off for defective goods — they shouldn&apos;t
                      go back on the shelf.
                    </span>
                  </span>
                </label>
              }
            />
          )}

          {nextStatuses.includes("Cancelled") && (
            <OrderSettleDialog
              orderNumber={orderNumber}
              action={cancelOrder}
              title="Cancel this order?"
              description="Every piece on it goes back to stock, and this can't be undone."
              confirmLabel="Cancel order"
              notePlaceholder="Customer unreachable"
              trigger={
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-none tracking-wider uppercase"
                >
                  <XCircle className="size-3.5" />
                  Cancel order
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
