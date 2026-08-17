import { Skeleton } from "@/components/ui/skeleton";

/** Rows drawn while the order query runs. Four is the common case, not a limit. */
const PLACEHOLDER_ROWS = 4;

/**
 * Mirrors the real page's boxes at their actual sizes — header block, count,
 * then rows of number / date / rail / total — so nothing shifts when the orders
 * land. Every Skeleton carries `rounded-none`: the base primitive ships
 * `rounded-md`, which the sharp-cornered design system overrides at each call
 * site rather than in the shadcn file.
 */
export default function MyOrdersLoading() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-32 pb-32 md:px-16 md:pt-40">
      <div className="border-outline-variant/20 flex flex-wrap items-end justify-between gap-6 border-b pb-8">
        <div>
          <Skeleton className="h-[18px] w-20 rounded-none" />
          <Skeleton className="mt-4 h-[44px] w-64 rounded-none md:h-[53px]" />
          <Skeleton className="mt-3 h-[26px] w-80 max-w-full rounded-none" />
        </div>
        <div className="flex flex-col items-end">
          <Skeleton className="h-5 w-8 rounded-none" />
          <Skeleton className="mt-2 h-[18px] w-14 rounded-none" />
        </div>
      </div>

      <div className="divide-outline-variant/20 mt-6 divide-y">
        {Array.from({ length: PLACEHOLDER_ROWS }).map((_, index) => (
          <div
            key={index}
            className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5 py-8"
          >
            <div>
              <Skeleton className="h-[30px] w-44 rounded-none" />
              <Skeleton className="mt-1 h-[19px] w-52 rounded-none" />
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-5 md:justify-end md:gap-x-10">
              <div className="min-w-[7.75rem]">
                <Skeleton className="h-[14px] w-24 rounded-none" />
                <Skeleton className="mt-2.5 h-px w-[7.75rem] rounded-none" />
              </div>
              <div className="flex items-center gap-5">
                <Skeleton className="h-[22px] w-28 rounded-none" />
                <Skeleton className="size-4 rounded-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
