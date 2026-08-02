import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSkeleton from "@/features/products/components/ProductCardSkeleton";

/**
 * Mirrors RelatedProducts' shell and card height. A plain grid stands in for
 * the carousel — the placeholder never scrolls, so embla would be dead weight.
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

        <div className="mt-10 grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} variant="quiet" />
          ))}
        </div>
      </div>
    </div>
  );
}
