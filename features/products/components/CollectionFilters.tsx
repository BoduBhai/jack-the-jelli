"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { CategoryFilterOption } from "@/features/products/lib/categories";
import type { SortOption } from "@/features/products/lib/products";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

const filterTriggerClasses =
  "h-auto w-fit gap-1.5 rounded-none border-0 bg-transparent p-0 text-[12px] font-semibold tracking-widest text-(--on-surface-variant) uppercase transition-colors duration-300 hover:text-foreground focus-visible:ring-0 data-[state=open]:text-foreground data-placeholder:text-(--on-surface-variant)";

/**
 * Filtering lives in the URL so the page can stay a Server Component and do
 * the work in Mongo. Search is submit-triggered (Enter / icon click), not
 * debounced per keystroke — this is a public storefront, not an admin table.
 */
export default function CollectionFilters({
  categories,
}: {
  categories: CategoryFilterOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(currentQ);

  // Re-sync the box when the URL changes from elsewhere (back button, a reset
  // link). Adjusting state during render rather than in an effect — an effect
  // here would be a cascading render.
  const [syncedQ, setSyncedQ] = useState(currentQ);
  if (currentQ !== syncedQ) {
    setSyncedQ(currentQ);
    setSearch(currentQ);
  }

  const category = searchParams.get("category") ?? "all";
  const sort = (searchParams.get("sort") as SortOption) || "newest";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    startTransition(() => router.replace(`?${params.toString()}`));
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    setParam("q", search.trim());
  };

  const clearSearch = () => {
    setSearch("");
    setParam("q", "");
  };

  return (
    <div
      className="flex flex-col gap-6 border-y border-[rgba(138,121,104,0.2)] py-6 sm:flex-row sm:items-center sm:justify-between"
      data-pending={isPending || undefined}
    >
      <form
        onSubmit={submitSearch}
        role="search"
        className="relative w-full sm:max-w-xs"
      >
        <button
          type="submit"
          aria-label="Search"
          className="absolute top-1/2 left-0 -translate-y-1/2"
        >
          <Search className="text-on-surface-variant h-4 w-4" />
        </button>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search collection..."
          aria-label="Search collection"
          className="h-auto rounded-none border-0 border-b border-secondary bg-transparent py-1.5 pr-6 pl-6 text-[16px] shadow-none focus-visible:ring-0"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute top-1/2 right-0 -translate-y-1/2"
          >
            <X className="text-on-surface-variant h-4 w-4" />
          </button>
        )}
      </form>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <Select value={category} onValueChange={(value) => setParam("category", value)}>
          <SelectTrigger
            className={filterTriggerClasses}
            aria-label="Filter by category"
          >
            <span>
              Category
              {category !== "all"
                ? `: ${categories.find((c) => c.id === category)?.name ?? ""}`
                : ""}
            </span>
          </SelectTrigger>
          <SelectContent position="popper" align="start" sideOffset={8}>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(value) => setParam("sort", value)}
        >
          <SelectTrigger
            className={filterTriggerClasses}
            aria-label="Sort products"
          >
            <span>Sort by: {sortLabels[sort]}</span>
          </SelectTrigger>
          <SelectContent position="popper" align="start" sideOffset={8}>
            {(Object.keys(sortLabels) as SortOption[]).map((option) => (
              <SelectItem key={option} value={option}>
                {sortLabels[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
