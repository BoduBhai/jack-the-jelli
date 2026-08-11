import Link from "next/link";
import { House, LayoutDashboard } from "lucide-react";

import MessageScreen, {
  messageScreenActionClass,
} from "@/components/layout/MessageScreen";

/**
 * Catches `notFound()` from admin/products/[id] and admin/orders/[id]. Sitting
 * inside admin/layout.tsx means requireAdmin() has already run and the sidebar
 * stays on screen, so a stale bookmark doesn't throw an admin out of the
 * dashboard entirely.
 */
export default function AdminNotFound() {
  return (
    <MessageScreen
      variant="admin"
      eyebrow="404"
      title="Record not found"
      description="This order, product or customer may have been deleted, or the address is incomplete."
      actions={
        <>
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
