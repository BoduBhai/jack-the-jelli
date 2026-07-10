import { Skeleton } from "@/components/ui/skeleton";

export default function SidebarSkeleton() {
  return (
    <div className="bg-surface-container-low border-outline-variant/20 fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col gap-4 border-r px-6 md:flex">
      <div className="bg-surface-container-highest h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-32" />
      <div className="mt-8 flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-5 w-40" />
        ))}
      </div>
    </div>
  );
}
