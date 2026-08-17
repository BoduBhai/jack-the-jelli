"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Fades page content in on every route change, so a navigation reads as one
 * movement rather than an instant swap.
 *
 * Keyed on the pathname rather than implemented as `template.tsx`, which is the
 * conventional answer, because a template is keyed to *its own segment level*:
 * one at `app/(storefront)/` would sit out `/collection` → `/collection/[slug]`
 * and `/my-orders` → `/my-orders/[orderNumber]`, which are the two navigations
 * on this site most worth covering. Catching those with templates means a file
 * per segment and a double fade wherever they nest. One keyed wrapper covers
 * every path change exactly once.
 *
 * Search params are deliberately not part of the key: `/collection?category=…`
 * re-renders in place, and fading the grid on every filter click would read as
 * a flicker, not as care.
 *
 * `className` exists because the admin shell makes its children flex items —
 * the wrapper has to re-establish that context or `flex-1` inside the page
 * stops resolving.
 */
export default function PageFade({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={cn("page-fade", className)}>
      {children}
    </div>
  );
}
