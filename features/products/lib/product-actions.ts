"use server";

import {
  getPublicProducts,
  type SortOption,
} from "@/features/products/lib/products";
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
 */
export async function loadMoreProducts(params: {
  q?: string;
  category?: string;
  sort?: SortOption;
  page: number;
}): Promise<LoadMoreProductsResult> {
  const result = await getPublicProducts({
    q: params.q,
    categoryId: params.category,
    sort: params.sort,
    page: params.page,
  });

  return {
    products: result.products,
    page: result.page,
    totalPages: result.totalPages,
  };
}
