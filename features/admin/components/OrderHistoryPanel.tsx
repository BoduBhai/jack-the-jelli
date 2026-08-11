import OrderPanel from "@/features/admin/components/OrderPanel";
import type { OrderStatusEntryDTO } from "@/features/orders/lib/order-types";

/**
 * The order's status trail, oldest first — the audit record for who moved the
 * order when, and the note explaining why if one was left.
 */
export default function OrderHistoryPanel({
  history,
}: {
  history: OrderStatusEntryDTO[];
}) {
  return (
    <OrderPanel title="History">
      <ol className="space-y-3">
        {history.map((entry, index) => (
          <li
            key={`${entry.status}-${entry.at}-${index}`}
            className="flex items-baseline justify-between gap-4 text-sm"
          >
            <span className="text-foreground">
              {entry.status}
              {entry.note && (
                <span className="text-muted-foreground"> — {entry.note}</span>
              )}
            </span>
            <span className="text-muted-foreground/70 shrink-0 text-xs tracking-widest whitespace-nowrap uppercase">
              {new Date(entry.at).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </li>
        ))}
      </ol>
    </OrderPanel>
  );
}
