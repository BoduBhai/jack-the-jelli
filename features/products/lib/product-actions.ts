"use server";

import { toPageNumber, toSortOption } from "@/features/products/lib/constants";
import { getPublicProducts } from "@/features/products/lib/products";
import type { Product } from "@/features/products/lib/types";

export interface LoadMoreProductsResult {
  products: Product[];
  page: number;
  totalPages: number;
}

/**
 * Fetches the next page of the public collection for "Discover More" —
 * called directly from a Client Component (not via useActionState/FormData),
 * since it's a read, not a mutation, and its result is appended to local
 * state. No auth guard: this is public catalog data, same trust level as the
 * page itself.
 *
 * Every argument is re-validated here. A Server Action is a public HTTP
 * endpoint and its parameter types are erased at runtime, so a crafted request
 * can send anything — an unchecked `page` reaches Mongo's `skip()` as NaN and
 * throws.
 */
export async function loadMoreProducts(params: {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
}): Promise<LoadMoreProductsResult> {
  const result = await getPublicProducts({
    q: typeof params.q === "string" ? params.q.slice(0, 100) : undefined,
    categorySlug:
      typeof params.category === "string" ? params.category : undefined,
    sort: toSortOption(params.sort),
    page: toPageNumber(params.page),
  });

  return {
    products: result.products,
    page: result.page,
    totalPages: result.totalPages,
  };
}
