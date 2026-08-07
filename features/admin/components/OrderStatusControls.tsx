"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import FulfillmentBadge from "@/features/admin/components/FulfillmentBadge";
import { emptyFormState } from "@/features/admin/lib/form-state";
import { updateOrderStatus } from "@/features/admin/lib/order-actions";
import { ALLOWED_NEXT, isTerminal } from "@/features/orders/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/features/admin/lib/types";

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: "Awaiting collection",
  collected: "Collected on delivery",
  failed: "Not collected",
};

/**
 * The only place an order's status can be changed.
 *
 * The buttons offered are exactly `ALLOWED_NEXT[current]` — the same table the
 * Server Action enforces through its query filter. Showing an illegal option
 * and then rejecting it server-side would be a worse version of the same rule.
 */
export default function OrderStatusControls({
  orderNumber,
  status,
  paymentStatus,
}: {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}) {
  const [state, formAction, pending] = useActionState(
    updateOrderStatus,
    emptyFormState,
  );
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<OrderStatus | "">("");

  const nextStatuses = ALLOWED_NEXT[status];
  const terminal = isTerminal(status);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      // Held open briefly so the confirmation is visible before it closes.
      const timer = setTimeout(() => setOpen(false), 700);
      return () => clearTimeout(timer);
    }
    toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-4">
      <div className="border-border flex items-center justify-between border p-4">
        <div className="space-y-1">
          <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
            Fulfilment
          </p>
          <FulfillmentBadge status={status} />
        </div>

        {terminal ? (
          <span className="text-muted-foreground/60 text-xs tracking-widest uppercase">
            Final
          </span>
        ) : (
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) setChoice("");
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-secondary rounded-none"
                aria-label="Change fulfilment status"
              >
                <Pencil className="size-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Change fulfilment status</DialogTitle>
                <DialogDescription>
                  This order is {status}. Cancelling returns every piece on it
                  to stock, and can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>

              <form action={formAction}>
                <input type="hidden" name="orderNumber" value={orderNumber} />
                <input type="hidden" name="status" value={choice} />

                <div className="py-4">
                  <Label className="text-muted-foreground mb-3 block text-xs font-semibold tracking-widest uppercase">
                    Move to
                  </Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {nextStatuses.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        size="sm"
                        variant={
                          option === "Cancelled"
                            ? "destructive"
                            : choice === option
                              ? "secondary"
                              : "default"
                        }
                        className="rounded-none"
                        onClick={() => setChoice(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                {state.ok && state.message && (
                  <div className="mb-2 flex items-center gap-2 text-sm text-green-600">
                    <Check className="size-4" />
                    <span>{state.message}</span>
                  </div>
                )}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" size="sm">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button size="sm" type="submit" disabled={pending || !choice}>
                    {pending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border-border space-y-1 border p-4">
        <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
          Payment
        </p>
        <p className="text-foreground text-sm font-medium">
          {PAYMENT_LABELS[paymentStatus]}
        </p>
        {/* Not editable on purpose: for a cash-on-delivery order the payment
            outcome IS the fulfilment outcome. Delivered collects the cash;
            cancelling after it shipped means it came back unpaid. Letting the
            two be set independently would only create orders that contradict
            themselves. */}
        <p className="text-muted-foreground/60 pt-1 text-xs">
          Set automatically when the order is delivered or cancelled.
        </p>
      </div>
    </div>
  );
}
