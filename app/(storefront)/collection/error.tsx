"use client";

import { useEffect } from "react";
import Link from "next/link";
import { House, RotateCcw } from "lucide-react";

import MessageScreen, {
  messageScreenActionClass,
} from "@/components/layout/MessageScreen";

/**
 * Scoped to /collection so a failed product fetch retries just this segment
 * rather than the whole storefront. The route's own copy is kept — the generic
 * storefront boundary one level up says less.
 */
export default function CollectionError({
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
          We couldn&apos;t load the collection. Please try again.
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
