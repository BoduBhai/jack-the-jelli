import { Mail, MapPin, Phone } from "lucide-react";
import CustomerDeletedBadge from "@/features/admin/components/CustomerDeletedBadge";
import OrderPanel from "@/features/admin/components/OrderPanel";
import { formatBdPhone } from "@/features/orders/lib/phone";
import type { OrderDTO } from "@/features/orders/lib/order-types";

/**
 * Who to call and where to send it. Everything here is the snapshot taken at
 * checkout, not a live read of the account, so it stays the record for returns
 * and courier disputes no matter what happens to the customer afterwards.
 */
export default function OrderCustomerPanel({ order }: { order: OrderDTO }) {
  const { shippingAddress: address } = order;

  return (
    <OrderPanel title="Client & Shipping">
      <div className="space-y-3">
        <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
          Recipient
        </p>
        <p className="font-heading text-foreground text-xl">
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
            <span className="text-sm">{formatBdPhone(address.phone)}</span>
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
    </OrderPanel>
  );
}
