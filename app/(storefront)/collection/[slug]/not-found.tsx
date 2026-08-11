import Link from "next/link";
import { ArrowLeft, House } from "lucide-react";

import MessageScreen, {
  messageScreenActionClass,
} from "@/components/layout/MessageScreen";

/**
 * Scoped to the product route so a mistyped or retired slug lands on the
 * storefront's own 404 — nav, footer and voice intact — with copy about the
 * piece rather than the generic page-missing wording one level up.
 */
export default function ProductNotFound() {
  return (
    <MessageScreen
      eyebrow="404"
      title="This piece is no longer here"
      description="It may have been retired from the collection, or the address may be incomplete."
      actions={
        <>
          <Link href="/collection" className={messageScreenActionClass}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Browse The Collections
          </Link>
          <Link href="/" className={messageScreenActionClass}>
            <House className="size-4" aria-hidden="true" />
            Return Home
          </Link>
        </>
      }
    />
  );
}
