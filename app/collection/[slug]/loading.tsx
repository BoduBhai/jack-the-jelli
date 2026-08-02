import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <main className="flex-1">
      {/* Mirrors ProductDetailView's split layout so there's no shift on swap-in */}
      <div className="mx-auto max-w-360 px-5 pt-32 pb-32 md:px-16 md:pt-40">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <div className="w-full lg:w-3/5">
            <Skeleton className="bg-surface-container aspect-4/5 w-full rounded-none" />
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-none" />
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col lg:w-2/5">
            <Skeleton className="h-4 w-40 rounded-none" />
            <Skeleton className="mt-10 h-4 w-28 rounded-none" />
            <Skeleton className="mt-2 h-12 w-4/5 rounded-none md:h-16" />
            <Skeleton className="mt-4 h-6 w-32 rounded-none" />

            <div className="border-outline-variant/20 mt-8 border-t pt-6">
              <Skeleton className="h-5 w-full rounded-none" />
              <Skeleton className="mt-2 h-5 w-full rounded-none" />
              <Skeleton className="mt-2 h-5 w-2/3 rounded-none" />
            </div>

            <Skeleton className="mt-8 h-4 w-36 rounded-none" />
            <Skeleton className="mt-4 h-14 w-full rounded-none" />

            <div className="mt-8 flex flex-col gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full rounded-none" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
