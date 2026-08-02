import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSkeleton from "@/features/products/components/ProductCardSkeleton";

/**
 * Mirrors RelatedProducts' shell. The track below reproduces embla's own
 * markup — the overflow-hidden viewport, the negative-margin flex row and the
 * per-breakpoint `basis` of each slide — so the placeholder cards sit at the
 * exact widths the real carousel will use and nothing shifts when the
 * suspended section resolves. A plain div stands in for the carousel itself:
 * the placeholder never scrolls, so embla would be dead weight.
 */
export default function RelatedProductsSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-360 px-5 pb-32 md:px-16">
      <div className="border-outline-variant/20 border-t pt-16 md:pt-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-36 rounded-none" />
            <Skeleton className="h-10 w-64 rounded-none" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-11 rounded-none" />
            <Skeleton className="size-11 rounded-none" />
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="mt-10 -ml-4 flex md:-ml-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-w-0 shrink-0 grow-0 basis-[70%] pl-4 sm:basis-1/2 md:pl-8 lg:basis-1/3 xl:basis-1/4"
              >
                <ProductCardSkeleton variant="quiet" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
