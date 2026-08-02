import type { Metadata } from "next";
import NavBar from "@/components/layout/NavBar";
import CollectionHero from "@/features/products/components/CollectionHero";
import CollectionGrid from "@/features/products/components/CollectionGrid";
import { getCategoryFilterOptions } from "@/features/products/lib/categories";
import {
  getPublicProducts,
  type SortOption,
} from "@/features/products/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Collections | Jack The Jelli",
  description: "Discover our definitive selection of artisanal leather goods.",
};

const SORT_OPTIONS: SortOption[] = ["newest", "price-asc", "price-desc"];

interface CollectionPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function CollectionPage({
  searchParams,
}: CollectionPageProps) {
  const params = await searchParams;
  const sort =
    SORT_OPTIONS.find((option) => option === params.sort) ?? "newest";
  const page = Number.parseInt(params.page ?? "1", 10);

  const [{ products, total, page: currentPage, totalPages }, categories] =
    await Promise.all([
      getPublicProducts({
        q: params.q,
        categoryId: params.category,
        sort,
        page: Number.isFinite(page) ? page : 1,
      }),
      getCategoryFilterOptions(),
    ]);

  const query = { q: params.q, category: params.category, sort };

  return (
    <main className="flex-1">
      <NavBar />
      <CollectionHero />
      <CollectionGrid
        key={`${query.q ?? ""}-${query.category ?? ""}-${query.sort}`}
        products={products}
        categories={categories}
        total={total}
        page={currentPage}
        totalPages={totalPages}
        query={query}
      />
    </main>
  );
}
