import OrderHistoryRow from "@/features/orders/components/OrderHistoryRow";
import type { OrderSummaryDTO } from "@/features/orders/lib/order-types";

/**
 * The signed-in order history, newest first — the sort comes from the query
 * (features/orders/lib/orders.ts), not from here.
 *
 * Orders are grouped under a year marker only when the history actually spans
 * more than one year. A first-time customer would otherwise get a heading that
 * separates nothing from nothing.
 */
export default function OrderHistoryList({
  orders,
}: {
  orders: OrderSummaryDTO[];
}) {
  const groups = groupByYear(orders);

  if (groups.length < 2) {
    return (
      <ul className="divide-outline-variant/50 border-outline-variant/50 divide-y border-b">
        {orders.map((order) => (
          <OrderHistoryRow key={order.id} order={order} />
        ))}
      </ul>
    );
  }

  return (
    <div>
      {groups.map(({ year, orders: yearly }, index) => (
        <section key={year}>
          <h2
            className={`text-on-surface-variant border-outline-variant/20 border-b pb-3 text-[12px] font-semibold tracking-[0.1em] uppercase ${
              // The page header already rules off above the first group, so it
              // only needs clearing, not the full gap between years.
              index === 0 ? "" : "mt-16"
            }`}
          >
            {year}
          </h2>
          <ul className="divide-outline-variant/50 border-outline-variant/50 divide-y border-b">
            {yearly.map((order) => (
              <OrderHistoryRow key={order.id} order={order} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/**
 * Consecutive runs of the same year, preserving the incoming order. A plain
 * reduce rather than a Map keyed by year, so the output can't silently reorder
 * if the query's sort ever changes.
 */
function groupByYear(orders: OrderSummaryDTO[]) {
  const groups: { year: number; orders: OrderSummaryDTO[] }[] = [];

  for (const order of orders) {
    const year = new Date(order.createdAt).getFullYear();
    const current = groups.at(-1);

    if (current?.year === year) current.orders.push(order);
    else groups.push({ year, orders: [order] });
  }

  return groups;
}
