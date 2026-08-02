import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSkeleton from "@/features/products/components/ProductCardSkeleton";
import { PRODUCTS_PER_PAGE } from "@/features/products/lib/constants";

export default function CollectionLoading() {
  return (
    <>
      {/* Mirrors CollectionHero's text blocks so there's no layout shift on swap-in */}
      <section className="mx-auto max-w-360 px-5 pt-40 pb-16 text-center md:px-16 md:pt-48">
        <Skeleton className="mx-auto mb-6 h-10 w-64 rounded-none md:h-16 md:w-96" />
        <Skeleton className="mx-auto h-5 w-full max-w-2xl rounded-none" />
        <Skeleton className="mx-auto mt-2 h-5 w-2/3 max-w-2xl rounded-none" />
      </section>

      <section className="mx-auto max-w-360 px-5 pb-32 md:px-16">
        {/* Filter bar skeleton */}
        <div className="flex flex-col gap-6 border-y border-[rgba(138,121,104,0.2)] py-6 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-full rounded-none sm:max-w-xs" />
          <div className="flex items-center gap-8">
            <Skeleton className="h-4 w-24 rounded-none" />
            <Skeleton className="h-4 w-32 rounded-none" />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </>
  );
}
