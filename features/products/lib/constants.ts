// Collection constants shared by the server query layer and the client grid.
// Deliberately free of Mongoose imports so both sides can import one definition
// instead of keeping duplicated copies in sync by hand.

export const PRODUCTS_PER_PAGE = 9;

export const SORT_OPTIONS = ["newest", "price-asc", "price-desc"] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const DEFAULT_SORT: SortOption = "newest";

/**
 * URL search params and Server Action arguments are untrusted at runtime — the
 * TypeScript annotations on both are erased before the request arrives. Every
 * entry point coerces through these rather than casting.
 */
export function toSortOption(value: unknown): SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
    ? (value as SortOption)
    : DEFAULT_SORT;
}

/** Coerces anything to a positive integer page, falling back to the first. */
export function toPageNumber(value: unknown): number {
  const page =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
