import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  /** Current filters, so paging doesn't drop them. */
  params: Record<string, string | undefined>;
}

// Plain links: pagination needs no JS, and keeping it server-rendered means the
// page number survives a refresh or a shared URL.
export default function ProductPagination({
  page,
  totalPages,
  total,
  params,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) next.set(key, value);
    }
    if (target > 1) next.set("page", String(target));
    const query = next.toString();
    return query ? `?${query}` : "?";
  };

  const linkClass =
    "border-border hover:border-foreground flex size-10 items-center justify-center border text-sm transition-colors";
  const disabledClass = "text-muted-foreground/40 pointer-events-none";

  return (
    <nav
      aria-label="Product pages"
      className="flex items-center justify-between gap-4"
    >
      <p className="text-muted-foreground text-xs tracking-widest uppercase">
        Page {page} of {totalPages} · {total} item{total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={href(page - 1)}
          aria-label="Previous page"
          aria-disabled={page <= 1}
          className={cn(linkClass, page <= 1 && disabledClass)}
        >
          <ChevronLeft className="size-4" />
        </Link>
        <Link
          href={href(page + 1)}
          aria-label="Next page"
          aria-disabled={page >= totalPages}
          className={cn(linkClass, page >= totalPages && disabledClass)}
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </nav>
  );
}
