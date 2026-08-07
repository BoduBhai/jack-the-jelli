"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import OrderReceipt from "@/features/orders/components/OrderReceipt";
import OrderTimeline from "@/features/orders/components/OrderTimeline";
import { lookupOrder } from "@/features/orders/lib/track-actions";
import { emptyTrackState } from "@/features/orders/lib/track-state";
import { PAYMENT_STATUS_COPY } from "@/features/orders/lib/order-status";
import {
  fieldLabelClassName,
  underlineInputClassName,
} from "@/features/checkout/lib/checkout-form";

/**
 * Guest order tracking: order number plus the phone number the order was
 * placed with. The phone isn't a nicety — it's what stops this being a lookup
 * table for other people's addresses.
 */
export default function TrackOrderForm({
  defaultOrderNumber,
}: {
  /** Prefilled from ?order= on the confirmation email's link. */
  defaultOrderNumber?: string;
}) {
  const [state, formAction, pending] = useActionState(
    lookupOrder,
    emptyTrackState,
  );

  return (
    <div className="w-full">
      <form
        action={formAction}
        className="border-outline-variant/20 bg-surface-container-low/40 border p-8 md:p-10"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <Field className="flex-1">
            <FieldLabel htmlFor="order" className={fieldLabelClassName}>
              Order Number
            </FieldLabel>
            <Input
              id="order"
              name="order"
              defaultValue={state.values?.order ?? defaultOrderNumber}
              placeholder="JJ-250805-K3M9"
              autoComplete="off"
              spellCheck={false}
              className={`${underlineInputClassName} tracking-[0.1em] uppercase`}
            />
          </Field>

          <Field className="flex-1">
            <FieldLabel htmlFor="phone" className={fieldLabelClassName}>
              Phone Number
            </FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              defaultValue={state.values?.phone}
              placeholder="01XXXXXXXXX"
              className={underlineInputClassName}
            />
          </Field>

          <button
            type="submit"
            disabled={pending}
            className="bg-foreground text-background hover:bg-secondary inline-flex shrink-0 items-center justify-center gap-2 px-10 py-3.5 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40"
          >
            {pending && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            Track Order
          </button>
        </div>

        {state.message && (
          <p
            role="alert"
            aria-live="polite"
            className="text-destructive mt-6 text-[14px]"
          >
            {state.message}
          </p>
        )}
      </form>

      {state.order && (
        <div className="mt-16">
          <div className="border-outline-variant/20 mb-12 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-foreground font-serif text-[28px] leading-tight tracking-tight">
                Order {state.order.orderNumber}
              </h2>
              <p className="text-on-surface-variant mt-1 text-[15px]">
                Placed{" "}
                {new Date(
                  state.order.placedAt ?? state.order.createdAt,
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-on-surface-variant text-[12px] font-semibold tracking-[0.1em] uppercase">
                Payment
              </p>
              <p className="text-foreground mt-1 text-[15px]">
                {PAYMENT_STATUS_COPY[state.order.paymentStatus].customer}
              </p>
            </div>
          </div>

          <OrderTimeline order={state.order} />

          <div className="mt-16">
            <h3 className="border-outline-variant/20 text-on-surface-variant mb-6 border-b pb-3 text-[12px] font-semibold tracking-[0.1em] uppercase">
              Your order
            </h3>
            <OrderReceipt order={state.order} />
          </div>
        </div>
      )}
    </div>
  );
}
