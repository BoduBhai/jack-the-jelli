"use client";

export default function CollectionError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="mx-auto max-w-360 px-5 py-40 text-center md:px-16">
      <h1 className="text-foreground font-serif text-[32px] leading-[1.2]">
        Something went wrong
      </h1>
      <p className="text-on-surface-variant mt-4 text-[16px]">
        We couldn&apos;t load the collection. Please try again.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="border-foreground text-foreground hover:bg-foreground hover:text-background mt-8 inline-flex items-center justify-center rounded-none border bg-transparent px-10 py-4 text-[12px] font-semibold tracking-widest uppercase transition-colors duration-300"
      >
        Try Again
      </button>
    </div>
  );
}
