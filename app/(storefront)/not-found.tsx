import Link from "next/link";
import { ArrowLeft, House } from "lucide-react";

import MessageScreen, {
  messageScreenActionClass,
} from "@/components/layout/MessageScreen";

/**
 * Catches `notFound()` from any storefront route without a closer boundary —
 * today that's my-orders/[orderNumber]. Sitting inside (storefront)/layout.tsx
 * means the nav and footer survive, so the visitor can carry on shopping
 * instead of dead-ending.
 *
 * Unmatched URLs never reach here; those are handled by the root
 * app/not-found.tsx.
 */
export default function StorefrontNotFound() {
  return (
    <MessageScreen
      eyebrow="404"
      title="We can't find that page"
      description="The address may be incomplete, or what you're looking for may have moved."
      actions={
        <>
          <Link href="/" className={messageScreenActionClass}>
            <House className="size-4" aria-hidden="true" />
            Return Home
          </Link>
          <Link href="/collection" className={messageScreenActionClass}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Browse The Collection
          </Link>
        </>
      }
    />
  );
}
