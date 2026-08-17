"use client";

import Link from "next/link";
import { LinkPending } from "@/components/layout/RouteProgress";

/**
 * `next/link` that also feeds the route-change indicator.
 *
 * A drop-in replacement — every prop is forwarded untouched, and the extra
 * child renders no DOM (see `LinkPending`), so swapping an existing `<Link>`
 * for this changes nothing about how it lays out or behaves.
 *
 * Used on the navigation surfaces that can actually stall: anything routing to
 * a page with no `loading.tsx` of its own (`/checkout`, `/account`,
 * `/my-orders/[orderNumber]`, all of `/admin`). Plain `<Link>` is still right
 * for in-page anchors, and for the error and 404 screens, whose destinations
 * are static and prefetched.
 */
export default function AppLink({
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <LinkPending />
    </Link>
  );
}
