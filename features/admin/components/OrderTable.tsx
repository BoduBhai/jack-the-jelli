import AppLink from "@/components/layout/AppLink";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomerDeletedBadge from "@/features/admin/components/CustomerDeletedBadge";
import FulfillmentBadge from "@/features/admin/components/FulfillmentBadge";
import { formatBdPhone } from "@/features/orders/lib/phone";
import { formatPrice } from "@/features/products/lib/format";
import type { OrderSummaryDTO } from "@/features/orders/lib/order-types";

const TABLE_HEADERS = [
  "Order",
  "Client",
  "Value",
  "Delivery",
  "Action",
] as const;

/**
 * The order manager's list view.
 *
 * `filtered` only picks the empty-state copy: an empty page means something
 * different when filters are on than when the shop has taken no orders yet.
 */
export default function OrderTable({
  orders,
  filtered,
}: {
  orders: OrderSummaryDTO[];
  filtered: boolean;
}) {
  return (
    <div className="border-border bg-card flex-1 overflow-x-auto border transition-shadow duration-500 hover:shadow-[0px_12px_32px_rgba(26,26,26,0.04)]">
      <Table className="min-w-3xl">
        <TableHeader>
          <TableRow>
            {TABLE_HEADERS.map((header) => (
              <TableHead key={header}>{header.toUpperCase()}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="text-base">
          {orders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={TABLE_HEADERS.length}
                className="text-muted-foreground py-16 text-center text-sm"
              >
                {filtered
                  ? "No orders match these filters."
                  : "No orders yet. They'll appear here the moment one is placed."}
              </TableCell>
            </TableRow>
          )}

          {orders.map((order) => (
            <TableRow
              key={order.id}
              className={
                // Pending is the queue that needs a phone call — the one row
                // state that's genuinely "action required".
                order.status === "Pending" ? "bg-accent/40" : "hover:bg-muted"
              }
            >
              <TableCell className="py-8">
                <div className="font-heading text-foreground text-lg tracking-wide">
                  {order.orderNumber}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </TableCell>
              <TableCell className="py-8">
                <div className="text-foreground font-medium">
                  {order.customerName}
                </div>
                <div className="text-muted-foreground mt-1 text-xs font-semibold tracking-widest">
                  {formatBdPhone(order.customerPhone)}
                </div>
                {order.customerDeleted && (
                  <div className="mt-2">
                    <CustomerDeletedBadge />
                  </div>
                )}
              </TableCell>
              <TableCell className="text-foreground py-8 tracking-wide">
                {formatPrice(order.totalAmount)}
              </TableCell>
              <TableCell className="py-8">
                <FulfillmentBadge status={order.status} />
              </TableCell>
              <TableCell className="py-8 text-left">
                <Button
                  asChild
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-none bg-transparent text-sm tracking-wider uppercase"
                >
                  <AppLink
                    href={`/admin/orders/${encodeURIComponent(order.orderNumber)}`}
                  >
                    View Details
                  </AppLink>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
