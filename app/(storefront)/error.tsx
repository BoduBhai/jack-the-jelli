"use client";

import { useEffect } from "react";
import Link from "next/link";
import { House, RotateCcw } from "lucide-react";

import MessageScreen, {
  messageScreenActionClass,
} from "@/components/layout/MessageScreen";

/**
 * Catch-all for the storefront. Renders inside (storefront)/layout.tsx, so nav
 * and footer stay put while this is in control.
 *
 * It does not cover a throw in StorefrontLayout itself — an error boundary
 * never wraps the layout of its own segment. That case falls to app/error.tsx.
 */
export default function StorefrontError({
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
      live="alert"
      eyebrow="Error"
      title="Something went wrong"
      description={
        <>
          We couldn&apos;t load this page. Please try again.
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
