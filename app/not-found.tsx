import Link from "next/link";
import { ArrowLeft, House } from "lucide-react";

import MessageScreen, {
  messageScreenActionClass,
} from "@/components/layout/MessageScreen";

/**
 * The app-wide 404. Besides catching any `notFound()` that escapes every
 * scoped boundary, Next routes *all* unmatched URLs here — that is the whole
 * reason this file exists, and why a mistyped address no longer lands on the
 * framework's unstyled default.
 *
 * It renders inside app/layout.tsx alone, so there is no nav or footer to
 * inherit; `standalone` supplies the brand mark and centres the column
 * instead. Deliberately worded differently from the storefront 404 so it's
 * obvious which boundary fired.
 *
 * Do not add an app/loading.tsx — a root Suspense boundary would flush the
 * response before this resolves and downgrade the 404 to a 200.
 */
export default function NotFound() {
  return (
    <MessageScreen
      standalone
      eyebrow="404"
      title="This page doesn't exist"
      description="The address may be incomplete, or the page may have been retired."
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
