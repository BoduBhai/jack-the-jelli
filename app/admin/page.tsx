import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FulfillmentBadge from "@/features/admin/components/FulfillmentBadge";
import OrderFilters from "@/features/admin/components/OrderFilters";
import ProductPagination from "@/features/admin/components/ProductPagination";
import ReleaseDraftsButton from "@/features/admin/components/ReleaseDraftsButton";
import { getOrders } from "@/features/admin/lib/orders";
import { ADMIN_SETTABLE_STATUSES } from "@/features/orders/lib/order-status";
import { formatBdPhone } from "@/features/orders/lib/phone";
import { formatPrice } from "@/features/products/lib/format";
import type { AdminSettableStatus } from "@/features/admin/lib/types";

export const dynamic = "force-dynamic";

const TABLE_HEADERS = [
  "Order",
  "Client",
  "Value",
  "Delivery",
  "Action",
] as const;

interface AdminOrdersProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersProps) {
  const params = await searchParams;

  // Anything unrecognised is dropped rather than passed to Mongo.
  const status = ADMIN_SETTABLE_STATUSES.find(
    (value): value is AdminSettableStatus => value === params.status,
  );
  const parsedPage = Number.parseInt(params.page ?? "1", 10);

  const { orders, total, page, totalPages, counts, staleDraftCount } =
    await getOrders({
      q: params.q,
      status,
      page: Number.isFinite(parsedPage) ? parsedPage : 1,
    });

  const filtered = Boolean(params.q || status);

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-heading text-3xl tracking-widest">Order Manager</h1>
        <ReleaseDraftsButton count={staleDraftCount} />
      </header>

      <OrderFilters counts={counts} />

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
                    <Link
                      href={`/admin/orders/${encodeURIComponent(order.orderNumber)}`}
                    >
                      View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductPagination
        page={page}
        totalPages={totalPages}
        total={total}
        params={{ q: params.q, status: params.status }}
        label="Order pages"
      />
    </div>
  );
}
