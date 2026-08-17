import {
  ORDER_STATUS_COPY,
  ORDER_STATUS_TONE,
  TRACKING_STEPS,
  type OrderStatus,
} from "@/features/orders/lib/order-status";

/**
 * The status of one order, at list scale: the customer-facing label over four
 * hairline segments that fill as the order advances.
 *
 * It is the same object as OrderTimeline on the detail page, drawn at a
 * different zoom — same steps, same "reached" rule, same filled/hollow
 * language — so a row and the page it opens read as one thing.
 *
 * The rail is `aria-hidden` throughout: the label above it already states
 * where the order is, and a screen reader gains nothing from four unlabelled
 * rules restating it.
 */
export default function OrderProgressRail({ status }: { status: OrderStatus }) {
  const tone = ORDER_STATUS_TONE[status];
  const halted = tone === "halted";
  const cancelled = status === "Cancelled";

  // -1 for Draft, which isn't a tracking step. It never reaches a customer
  // query anyway, and -1 correctly lights nothing if one ever slips through.
  const reachedIndex = TRACKING_STEPS.indexOf(
    status as (typeof TRACKING_STEPS)[number],
  );

  return (
    <div className="flex min-w-[7.75rem] flex-col gap-2.5">
      <span
        className={`text-[11px] font-semibold tracking-[0.1em] uppercase ${
          cancelled
            ? "text-destructive"
            : tone === "complete"
              ? "text-foreground"
              : "text-on-surface-variant"
        }`}
      >
        {ORDER_STATUS_COPY[status].label}
      </span>

      {halted ? (
        // A cancelled or returned order left the sequence rather than finishing
        // it, so a part-filled rail would misreport it as stalled mid-transit.
        // One unbroken rule says "this stopped" instead.
        <span
          aria-hidden="true"
          className={`h-px w-[7.75rem] ${
            cancelled ? "bg-destructive/40" : "bg-outline-variant/50"
          }`}
        />
      ) : (
        <span aria-hidden="true" className="flex gap-1.5">
          {TRACKING_STEPS.map((step, index) => (
            <span
              key={step}
              className={`h-px w-7 ${
                reachedIndex >= index
                  ? "bg-foreground"
                  : "bg-outline-variant/50"
              }`}
            />
          ))}
        </span>
      )}
    </div>
  );
}
