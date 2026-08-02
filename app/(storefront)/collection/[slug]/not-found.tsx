import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Scoped to the product route so a mistyped or retired slug lands on the
 * storefront's own 404 — nav, footer and voice intact — instead of the bare
 * global one.
 */
export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-360 px-5 py-40 text-center md:px-16">
      <p className="text-on-surface-variant text-[12px] font-semibold tracking-[0.1em] uppercase">
        404
      </p>
      <h1 className="text-foreground mt-4 font-serif text-[40px] leading-[1.2] md:text-[56px] md:leading-[1.1]">
        This piece is no longer here
      </h1>
      <p className="text-on-surface-variant mx-auto mt-4 max-w-xl text-[16px] leading-[1.6]">
        It may have been retired from the collection, or the address may be
        incomplete.
      </p>
      <Link
        href="/collection"
        className="border-foreground text-foreground hover:bg-foreground hover:text-background mt-10 inline-flex items-center justify-center gap-2 rounded-none border bg-transparent px-10 py-4 text-[12px] font-semibold tracking-widest uppercase transition-colors duration-300"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Browse The Collections
      </Link>
    </div>
  );
}
