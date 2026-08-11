"use client";

import { useEffect } from "react";
import Link from "next/link";
import { House, RotateCcw } from "lucide-react";

import MessageScreen, {
  messageScreenActionClass,
} from "@/components/layout/MessageScreen";

/**
 * The gap none of the scoped boundaries can cover: a throw inside
 * (storefront)/layout.tsx, (auth)/layout.tsx, or admin/layout.tsx — an error
 * boundary never wraps the layout of its own segment.
 *
 * It renders inside app/layout.tsx alone and deliberately does not pull in
 * NavBar or Footer: if StorefrontLayout is what threw, rendering it again here
 * would re-throw and bounce straight to global-error. `standalone` gives it
 * the brand mark and nothing else.
 */
export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MessageScreen
      standalone
      live="alert"
      eyebrow="Error"
      title="Something went wrong"
      description={
        <>
          We hit a problem loading the page. Please try again.
          {error.digest ? (
            <span className="mt-6 block text-[12px]">
              Reference: {error.digest}
            </span>
          ) : null}
        </>
      }
      actions={
        <>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className={messageScreenActionClass}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try Again
          </button>
          <Link href="/" className={messageScreenActionClass}>
            <House className="size-4" aria-hidden="true" />
            Return Home
          </Link>
        </>
      }
    />
  );
}
