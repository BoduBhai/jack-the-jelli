import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { getOrdersForUser } from "@/features/orders/lib/orders";
import { ORDER_STATUS_COPY } from "@/features/orders/lib/order-status";
import { formatPrice } from "@/features/products/lib/format";

export const metadata: Metadata = {
  title: "My Orders | Jack The Jelli",
  robots: { index: false, follow: false },
};

/**
 * The signed-in tracking path. Guests use /track instead — checkout never
 * required an account, so neither can this.
 *
 * Orders placed as a guest appear here once claimed: the sign-in hook in
 * lib/auth.ts attaches any order whose guestEmail matches the user's verified
 * email.
 */
export default async function MyOrdersPage() {
  const session = await requireAuth("/my-orders");
  const orders = await getOrdersForUser(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-5 pt-32 pb-32 md:px-16 md:pt-40">
      <header className="border-outline-variant/20 border-b pb-8">
        <h1 className="text-foreground font-serif text-[40px] leading-[1.1] tracking-tight md:text-[48px]">
          My Orders
        </h1>
        <p className="text-on-surface-variant mt-3 text-[16px] leading-relaxed">
          Every order placed with this account, newest first.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="text-on-surface-variant max-w-md text-[16px] leading-relaxed">
            Nothing here yet. Orders placed as a guest appear automatically once
            you sign in with the same email address.
          </p>
          <Link
            href="/collection"
            className="border-foreground text-foreground hover:bg-foreground hover:text-background mt-10 inline-flex items-center justify-center border px-10 py-4 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors duration-300"
          >
            Browse the collection
          </Link>
        </div>
      ) : (
        <ul className="divide-outline-variant/20 divide-y">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/my-orders/${encodeURIComponent(order.orderNumber)}`}
                className="hover:bg-surface-container-low/60 flex flex-wrap items-center justify-between gap-4 py-7 transition-colors duration-300"
              >
                <div>
                  <p className="text-foreground font-serif text-[20px] tracking-[0.08em]">
                    {order.orderNumber}
                  </p>
                  <p className="text-on-surface-variant mt-1 text-[13px]">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {order.itemCount}{" "}
                    {order.itemCount === 1 ? "piece" : "pieces"}
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  <span
                    className={`text-[11px] font-semibold tracking-[0.1em] uppercase ${
                      order.status === "Cancelled"
                        ? "text-destructive"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {ORDER_STATUS_COPY[order.status].label}
                  </span>
                  <span className="text-foreground text-[16px] tabular-nums">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
