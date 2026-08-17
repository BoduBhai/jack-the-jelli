import AppLink from "@/components/layout/AppLink";
import { ArrowRight } from "lucide-react";
import OrderProgressRail from "@/features/orders/components/OrderProgressRail";
import {
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_COPY,
} from "@/features/orders/lib/order-status";
import type { OrderSummaryDTO } from "@/features/orders/lib/order-types";
import { formatPrice } from "@/features/products/lib/format";

/**
 * One order in the signed-in history, opening its detail page.
 *
 * The whole row is a single link rather than a card with several targets —
 * there's exactly one thing to do with an order here, and one large hit area
 * beats three small ones on a phone.
 */
export default function OrderHistoryRow({ order }: { order: OrderSummaryDTO }) {
  const halted = ORDER_STATUS_TONE[order.status] === "halted";

  // Cash on delivery is the default and the only arrangement offered, so
  // saying so on every row is noise. The other three states are all news:
  // money that came back, money that never arrived, money that settled.
  const payment =
    order.paymentStatus === "pending"
      ? null
      : PAYMENT_STATUS_COPY[order.paymentStatus].customer;

  return (
    <li>
      <AppLink
        href={`/my-orders/${encodeURIComponent(order.orderNumber)}`}
        // The negative margin lets the hover fill bleed into the page gutter
        // instead of stopping flush with the text, which reads as a stray box.
        className={`group hover:bg-surface-container focus-visible:bg-surface-container focus-visible:outline-foreground relative -mx-4 flex flex-wrap items-center justify-between gap-x-10 gap-y-5 px-4 py-8 transition-colors duration-300 focus-visible:outline-2 focus-visible:-outline-offset-2 ${
          halted ? "opacity-60" : ""
        }`}
      >
        {/* Marks the hovered row as picked out rather than merely tinted. A
            hairline because that's the vocabulary the rest of the page speaks
            in — the row dividers and the status rail are the same weight. */}
        <span
          aria-hidden="true"
          className="bg-foreground absolute inset-y-0 left-0 w-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="min-w-0">
          <p className="text-foreground group-hover:text-secondary font-serif text-[20px] tracking-[0.08em] transition-colors duration-300">
            {order.orderNumber}
          </p>
          <p className="text-on-surface-variant mt-1 text-[13px]">
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {order.itemCount} {order.itemCount === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {/* justify-between until there's room to gather status and total on the
            right: once this group wraps onto its own line it spans the full
            width, and holding both to the right edge would leave the rail
            stranded in the middle of it. */}
        <div className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-5 md:justify-end md:gap-x-10">
          <OrderProgressRail status={order.status} />

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-foreground font-serif text-[22px] leading-none tabular-nums">
                {formatPrice(order.totalAmount)}
              </p>
              {payment && (
                <p className="text-on-surface-variant mt-2 text-[11px] font-semibold tracking-[0.1em] uppercase">
                  {payment}
                </p>
              )}
            </div>

            <ArrowRight
              aria-hidden="true"
              className="text-on-surface-variant size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </div>
      </AppLink>
    </li>
  );
}
