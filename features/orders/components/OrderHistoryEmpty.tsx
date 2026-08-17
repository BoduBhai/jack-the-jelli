import Link from "next/link";
import { messageScreenActionClass } from "@/components/layout/MessageScreen";

/**
 * Shown when the account has no orders attached to it yet.
 *
 * Hand-rolled rather than reusing <MessageScreen>, which renders an <h1> the
 * page has already spent. It borrows that component's action class so the
 * bordered uppercase control still exists in exactly one place.
 *
 * The /track link matters more than it looks: an order placed as a guest under
 * a different address is invisible here and will stay invisible, because
 * claimGuestOrders only matches the account's own verified email. Without this
 * link that customer has no route to their order at all.
 */
export default function OrderHistoryEmpty() {
  return (
    <div className="flex flex-col items-center py-24 text-center md:py-32">
      <p className="text-on-surface-variant text-[12px] font-semibold tracking-[0.1em] uppercase">
        No orders yet
      </p>

      <h2 className="text-foreground mt-5 max-w-md font-serif text-[28px] leading-[1.25] tracking-tight md:text-[32px]">
        Your history begins with the first piece.
      </h2>

      <p className="text-on-surface-variant mt-4 max-w-md text-[16px] leading-relaxed">
        Anything ordered as a guest appears here on its own, once you sign in
        with the same email address.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href="/collection" className={messageScreenActionClass}>
          Browse the collection
        </Link>
        <Link
          href="/track"
          className="text-on-surface-variant hover:text-foreground px-4 py-4 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors duration-300"
        >
          Track a guest order
        </Link>
      </div>
    </div>
  );
}
