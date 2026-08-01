"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Filtering lives in the URL so the list page can stay a Server Component and
 * do the work in Mongo. Every change resets to page 1 — otherwise you can land
 * on page 4 of a two-page result.
 */
export default function ProductFilters() {
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

  // Debounce typing into the URL.
  useEffect(() => {
    if (search.trim() === currentQ) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search.trim()) params.set("q", search.trim());
      else params.delete("q");
      params.delete("page");
      startTransition(() => router.replace(`?${params.toString()}`));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, currentQ, router, searchParams]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    startTransition(() => router.replace(`?${params.toString()}`));
  };

  return (
    <div
      className="flex flex-col gap-4 sm:flex-row sm:items-center"
      data-pending={isPending || undefined}
    >
      <Field
        className="border-primary flex-1 border-b p-2"
        orientation="horizontal"
      >
        <Input
          className="focus-visible:border-input focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={search}
          placeholder="Search by name, SKU..."
          aria-label="Search products"
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search />
      </Field>

      <Field className="border-primary w-48 border-b p-2">
        <Select
          value={searchParams.get("stock") ?? "all"}
          onValueChange={(value) => setParam("stock", value)}
        >
          <SelectTrigger aria-label="Filter by stock status">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field className="border-primary w-48 border-b p-2">
        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(value) => setParam("status", value)}
        >
          <SelectTrigger aria-label="Filter by publish status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
