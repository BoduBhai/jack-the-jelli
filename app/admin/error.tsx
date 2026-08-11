"use client";

import { useEffect } from "react";
import Link from "next/link";
import { House, LayoutDashboard, RotateCcw } from "lucide-react";

import MessageScreen, {
  messageScreenActionClass,
} from "@/components/layout/MessageScreen";

/**
 * Catch-all for the dashboard, rendered inside admin/layout.tsx so the sidebar
 * survives. A throw in the layout itself — including requireAdmin() failing
 * because Mongo is unreachable — falls through to app/error.tsx instead.
 */
export default function AdminError({
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
      variant="admin"
      live="alert"
      eyebrow="Error"
      title="Something went wrong"
      description={
        <>
          We couldn&apos;t load this view. Please try again.
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
          <Link href="/admin" className={messageScreenActionClass}>
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Back To Dashboard
          </Link>
          <Link href="/" className={messageScreenActionClass}>
            <House className="size-4" aria-hidden="true" />
            Go To Storefront
          </Link>
        </>
      }
    />
  );
}
