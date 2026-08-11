import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerDeletedBadge from "@/features/admin/components/CustomerDeletedBadge";
import OrderStatusControls from "@/features/admin/components/OrderStatusControls";
import { getOrderByNumber } from "@/features/admin/lib/orders";
import { ORDER_STATUS_COPY } from "@/features/orders/lib/order-status";
import { formatBdPhone } from "@/features/orders/lib/phone";
import { formatPrice } from "@/features/products/lib/format";

export const dynamic = "force-dynamic";

/**
 * A Server Component on real data — the mock array and the `setTimeout` "save"
 * that used to back this screen are gone. Route param is the order number, not
 * an ObjectId: it's what the customer reads out on the phone.
 *
 * Every value rendered here comes from the order's own snapshot, so editing or
 * deleting a product afterwards can never rewrite what was bought.
 */
export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderByNumber(id);
  if (!order) notFound();

  const { shippingAddress: address } = order;
  const unitCount = order.items.reduce((total, item) => total + item.qty, 0);

  return (
    <div className="flex flex-col gap-12">
      <header className="border-border flex flex-col gap-4 border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="text-xs font-semibold tracking-widest uppercase">
              Back to Orders
            </span>
          </Link>
          <h1 className="font-heading text-foreground text-2xl font-medium tracking-wide">
            Order {order.orderNumber}
          </h1>
          <p className="text-muted-foreground text-sm">
            Placed{" "}
            {new Date(order.placedAt ?? order.createdAt).toLocaleString(
              "en-GB",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            )}{" "}
            · {ORDER_STATUS_COPY[order.status].description}
          </p>
        </div>

        {order.status === "Pending" && (
          <Button
            asChild
            className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
          >
            {/* The anti-fake-order gate: nothing gets packed until someone
                rings the customer. */}
            <a href={`tel:${address.phone}`}>
              <Phone className="size-4" />
              Call to confirm
            </a>
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-8 lg:col-span-4">
          <section className="border-border space-y-6 border p-6">
            <div>
              <h2 className="text-foreground text-sm font-semibold tracking-widest uppercase">
                Client &amp; Shipping
              </h2>
              <div className="bg-border mt-2 h-px w-16" />
            </div>

            <div className="space-y-3">
              <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
                Recipient
              </p>
              <p className="font-heading text-foreground text-xl font-medium">
                {address.fullName}
              </p>
              {/* The details below are the snapshot taken at checkout, so they
                  stand on their own — this only warns that looking the account
                  up will come back empty. */}
              {order.customerDeleted && <CustomerDeletedBadge />}
            </div>

            <div className="space-y-3">
              <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
                Contact
              </p>
              <div className="space-y-2">
                <a
                  href={`tel:${address.phone}`}
                  className="text-foreground hover:text-muted-foreground flex items-center gap-2.5 transition-colors"
                >
                  <Phone className="text-muted-foreground/60 size-4 shrink-0" />
                  <span className="text-sm">
                    {formatBdPhone(address.phone)}
                  </span>
                </a>
                {order.guestEmail ? (
                  <a
                    href={`mailto:${order.guestEmail}`}
                    className="text-foreground hover:text-muted-foreground flex items-center gap-2.5 transition-colors"
                  >
                    <Mail className="text-muted-foreground/60 size-4 shrink-0" />
                    <span className="text-sm">{order.guestEmail}</span>
                  </a>
                ) : (
                  <div className="text-muted-foreground/60 flex items-center gap-2.5">
                    <Mail className="size-4 shrink-0" />
                    {/* Email is optional at checkout by design. */}
                    <span className="text-sm italic">No email given</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
                Shipping Address
              </p>
              <div className="text-foreground flex gap-2.5 text-sm leading-relaxed">
                <MapPin className="text-muted-foreground/60 mt-0.5 size-4 shrink-0" />
                <span>
                  {address.street}
                  <br />
                  {address.thana}, {address.district}
                  <br />
                  {address.division} Division
                </span>
              </div>
              {address.notes && (
                <p className="text-muted-foreground border-border border-l-2 pl-3 text-sm italic">
                  {address.notes}
                </p>
              )}
            </div>
          </section>

          <section className="border-border space-y-6 border p-6">
            <div>
              <h2 className="text-foreground text-sm font-semibold tracking-widest uppercase">
                Delivery &amp; Payment
              </h2>
              <div className="bg-border mt-2 h-px w-16" />
            </div>

            <OrderStatusControls
              orderNumber={order.orderNumber}
              status={order.status}
              paymentStatus={order.paymentStatus}
              unitCount={unitCount}
            />
          </section>

          <section className="border-border space-y-4 border p-6">
            <div>
              <h2 className="text-foreground text-sm font-semibold tracking-widest uppercase">
                History
              </h2>
              <div className="bg-border mt-2 h-px w-16" />
            </div>
            <ol className="space-y-3">
              {order.statusHistory.map((entry, index) => (
                <li
                  key={`${entry.status}-${entry.at}-${index}`}
                  className="flex items-baseline justify-between gap-4 text-sm"
                >
                  <span className="text-foreground">
                    {entry.status}
                    {entry.note && (
                      <span className="text-muted-foreground">
                        {" "}
                        — {entry.note}
                      </span>
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
          </section>
        </div>

        <div className="lg:col-span-8">
          <section className="border-border space-y-6 border p-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-heading text-foreground text-lg font-medium">
                  Order Items
                </h2>
                <div className="bg-border mt-2 h-px w-16" />
              </div>
              <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
                {unitCount} Unit{unitCount === 1 ? "" : "s"} Total
              </p>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={`${item.productId}-${item.sku}`}
                  className="border-border hover:bg-accent/20 flex items-center gap-6 border px-5 py-5 transition-colors duration-300"
                >
                  <div className="bg-accent relative size-20 shrink-0 overflow-hidden">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground/30 flex size-full items-center justify-center">
                        <Package className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground/40 mb-1 text-[10px] font-semibold tracking-widest uppercase">
                      SKU: {item.sku}
                    </p>
                    <h3 className="font-heading text-foreground text-base font-medium">
                      {item.name}
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-sm font-semibold">
                      {formatPrice(item.lineTotal)}
                    </p>
                    <p className="text-muted-foreground/40 mt-1 text-[10px] font-semibold tracking-widest uppercase">
                      Qty: {item.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-border border-t pt-6">
              <div className="flex flex-col items-end space-y-4">
                <div className="w-full space-y-3 md:w-72">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Delivery ({order.shippingAddress.district})
                    </span>
                    <span className="text-foreground font-medium">
                      {order.deliveryFee === 0
                        ? "Free"
                        : formatPrice(order.deliveryFee)}
                    </span>
                  </div>
                </div>
                <div className="bg-border h-px w-full md:w-72" />
                <div className="flex w-full items-center justify-end md:w-72">
                  <span className="text-foreground text-xs font-semibold tracking-widest uppercase">
                    Total to collect
                  </span>
                  <span className="font-heading text-foreground ml-6 text-3xl font-medium">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
