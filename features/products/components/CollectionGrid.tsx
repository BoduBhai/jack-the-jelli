"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { MOCK_PRODUCTS } from "@/features/products/lib/mock-products";
import ProductCard from "@/features/products/components/ProductCard";

type SortOption = "newest" | "price-asc" | "price-desc";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

const filterTriggerClasses =
  "h-auto w-fit gap-1.5 rounded-none border-0 bg-transparent p-0 text-[12px] font-semibold tracking-widest text-(--on-surface-variant) uppercase transition-colors duration-300 hover:text-foreground focus-visible:ring-0 data-[state=open]:text-foreground data-placeholder:text-(--on-surface-variant)";

export default function CollectionGrid() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [color, setColor] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const categories = useMemo(
    () => Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category))),
    [],
  );
  const colors = useMemo(
    () => Array.from(new Set(MOCK_PRODUCTS.map((p) => p.color))),
    [],
  );

  const products = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = MOCK_PRODUCTS.filter((product) => {
      if (query && !product.name.toLowerCase().includes(query)) return false;
      if (category !== "all" && product.category !== category) return false;
      if (color !== "all" && product.color !== color) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [search, category, color, sort]);

  return (
    <section className="mx-auto max-w-360 px-5 pb-32 md:px-16">
      {/* Filter bar */}
      <div className="flex flex-col gap-6 border-y border-[rgba(138,121,104,0.2)] py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-on-surface-variant pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collection..."
            aria-label="Search collection"
            className="h-auto rounded-none border-0 border-b border-secondary bg-transparent py-1.5 pr-0 pl-6 text-[16px] shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center gap-8">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={filterTriggerClasses} aria-label="Filter by category">
              <span>
                Category
                {category !== "all" ? `: ${category}` : ""}
              </span>
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={8}>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={color} onValueChange={setColor}>
            <SelectTrigger className={filterTriggerClasses} aria-label="Filter by color">
              <span>
                Color
                {color !== "all" ? `: ${color}` : ""}
              </span>
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={8}>
              <SelectItem value="all">All Colors</SelectItem>
              {colors.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) => setSort(value as SortOption)}
          >
            <SelectTrigger className={filterTriggerClasses} aria-label="Sort products">
              <span>Sort by: {sortLabels[sort]}</span>
            </SelectTrigger>
            <SelectContent position="popper" align="end" sideOffset={8}>
              {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                <SelectItem key={option} value={option}>
                  {sortLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product grid */}
      {products.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-on-surface-variant mt-16 text-center text-[16px]">
          No pieces match your filters. Try clearing a filter or searching for
          something else.
        </p>
      )}

      {/* Discover more (static — full collection is already shown) */}
      <div className="mt-16 flex justify-center">
        <button
          type="button"
          className="border-foreground text-foreground hover:bg-foreground hover:text-background inline-flex items-center justify-center rounded-none border bg-transparent px-10 py-4 text-[12px] font-semibold tracking-widest uppercase transition-colors duration-300"
        >
          Discover More
        </button>
      </div>
    </section>
  );
}
