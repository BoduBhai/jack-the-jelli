import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="bg-surface-container aspect-4/5 w-full rounded-none" />
      <div className="mt-4 flex flex-col items-center gap-2">
        <Skeleton className="h-5 w-2/3 rounded-none" />
        <Skeleton className="h-4 w-1/3 rounded-none" />
      </div>
    </div>
  );
}
