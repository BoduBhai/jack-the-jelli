"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import CollectionSearch from "@/features/products/components/CollectionSearch";
import type { CategoryFilterOption } from "@/features/products/lib/categories";
import {
  SORT_OPTIONS,
  toSortOption,
  type SortOption,
} from "@/features/products/lib/constants";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

const filterTriggerClasses =
  "h-auto w-fit gap-1.5 rounded-none border-0 bg-transparent p-0 text-[12px] font-semibold tracking-widest text-(--on-surface-variant) uppercase transition-colors duration-300 hover:text-foreground focus-visible:ring-0 data-[state=open]:text-foreground data-placeholder:text-(--on-surface-variant)";

/**
 * Filtering lives in the URL so the page can stay a Server Component and do
 * the work in Mongo. The URL is still only written on submit or on picking a
 * suggestion — never per keystroke; CollectionSearch's predictive panel is a
 * read that leaves the address bar alone.
 */
export default function CollectionFilters({
  categories,
}: {
  categories: CategoryFilterOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Both params are hand-editable, so neither is trusted: an unknown value
  // falls back to the same default the server picked, instead of leaving the
  // trigger showing a blank label for a filter that isn't actually applied.
  const categoryParam = searchParams.get("category");
  const category = categories.some((c) => c.slug === categoryParam)
    ? (categoryParam as string)
    : "all";
  const sort = toSortOption(searchParams.get("sort"));

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) params.delete(key);
    else params.set(key, value);
    startTransition(() => router.replace(`?${params.toString()}`));
  };

  const activeCategoryName = categories.find((c) => c.slug === category)?.name;

  return (
    <div
      className="flex flex-col gap-6 border-y border-[rgba(138,121,104,0.2)] py-6 sm:flex-row sm:items-center sm:justify-between"
      data-pending={isPending || undefined}
    >
      <CollectionSearch onSearch={(value) => setParam("q", value)} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <Select
          value={category}
          onValueChange={(value) => setParam("category", value)}
        >
          <SelectTrigger
            className={filterTriggerClasses}
            aria-label="Filter by category"
          >
            <span>
              Category
              {activeCategoryName ? `: ${activeCategoryName}` : ""}
            </span>
          </SelectTrigger>
          <SelectContent position="popper" align="start" sideOffset={8}>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => setParam("sort", value)}>
          <SelectTrigger
            className={filterTriggerClasses}
            aria-label="Sort products"
          >
            <span>Sort by: {sortLabels[sort]}</span>
          </SelectTrigger>
          <SelectContent position="popper" align="start" sideOffset={8}>
            {SORT_OPTIONS.map((option) => (
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
