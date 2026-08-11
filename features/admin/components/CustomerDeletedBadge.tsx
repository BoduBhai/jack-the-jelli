import { UserX } from "lucide-react";

/**
 * Marks an order whose customer account was hard-deleted.
 *
 * Purely additive — the name, phone and address beside it are the snapshot
 * taken at checkout and still stand on their own. This only says the *account*
 * is gone, so nobody wastes time looking one up that no longer exists.
 *
 * Dashed and muted rather than destructive: nothing is wrong with the order.
 * Matches FulfillmentBadge's hand-rolled convention rather than shadcn's Badge,
 * which the admin panel doesn't use.
 */
export default function CustomerDeletedBadge() {
  return (
    <div className="border-muted-foreground/30 bg-muted inline-flex items-center gap-2 border border-dashed px-3 py-1">
      <UserX className="text-muted-foreground size-3.5 shrink-0" />
      <span className="text-muted-foreground text-[12px] leading-none font-semibold tracking-widest uppercase">
        Customer deleted
      </span>
    </div>
  );
}
