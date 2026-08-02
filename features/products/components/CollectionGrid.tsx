"use client";

import { useState, useTransition } from "react";
import CollectionFilters from "@/features/products/components/CollectionFilters";
import DiscoverMoreButton from "@/features/products/components/DiscoverMoreButton";
import ProductCard from "@/features/products/components/ProductCard";
import ProductCardSkeleton from "@/features/products/components/ProductCardSkeleton";
import type { CategoryFilterOption } from "@/features/products/lib/categories";
import { loadMoreProducts } from "@/features/products/lib/product-actions";
import type { SortOption } from "@/features/products/lib/products";
import type { Product } from "@/features/products/lib/types";

// Matches PRODUCTS_PER_PAGE in features/products/lib/products.ts. Duplicated
// rather than imported: that module pulls in Mongoose and must stay
// server-only.
const PRODUCTS_PER_PAGE_CLIENT = 9;

interface CollectionGridProps {
  products: Product[];
  categories: CategoryFilterOption[];
  total: number;
  page: number;
  totalPages: number;
  query: { q?: string; category?: string; sort: SortOption };
}

export default function CollectionGrid({
  products: initialProducts,
  categories,
  total,
  page: initialPage,
  totalPages,
  query,
}: CollectionGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(initialPage);
  const [addedCount, setAddedCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    startTransition(async () => {
      const result = await loadMoreProducts({
        q: query.q,
        category: query.category,
        sort: query.sort,
        page: page + 1,
      });
      setProducts((prev) => [...prev, ...result.products]);
      setPage(result.page);
      setAddedCount(result.products.length);
    });
  };

  return (
    <section className="mx-auto max-w-360 px-5 pb-32 md:px-16">
      <CollectionFilters categories={categories} />

      {products.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both motion-safe:duration-500"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <ProductCard product={product} priority={i < 3} />
            </div>
          ))}
        </div>
      ) : (
        <p
          role="status"
          className="text-on-surface-variant mt-16 text-center text-[16px]"
        >
          {total === 0 && !query.q && !query.category
            ? "No pieces are available yet. Check back soon."
            : "No pieces match your filters. Try clearing a filter or searching for something else."}
        </p>
      )}

      {isPending && (
        <div
          className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
          aria-hidden="true"
        >
          {Array.from({ length: PRODUCTS_PER_PAGE_CLIENT }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {products.length > 0 && (
        <DiscoverMoreButton
          onClick={handleLoadMore}
          isPending={isPending}
          hasMore={page < totalPages}
          addedCount={addedCount}
        />
      )}
    </section>
  );
}
