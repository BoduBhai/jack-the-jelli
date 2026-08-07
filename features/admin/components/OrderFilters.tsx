"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_SETTABLE_STATUSES } from "@/features/orders/lib/order-status";
import type { AdminSettableStatus } from "@/features/admin/lib/types";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Search and status filtering live in the URL, so the orders page stays a
 * Server Component and Mongo does the work — the same arrangement as
 * ProductFilters. Every change resets to page 1, or you can land on page 4 of
 * a two-page result.
 *
 * The tabs are the real state machine, not the invented "Action Required /
 * In Transit / Archived" set the mock carried.
 */
export default function OrderFilters({
  counts,
}: {
  counts: Record<AdminSettableStatus | "all", number>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(currentQ);

  // Re-sync the box when the URL changes from elsewhere (back button, a reset
  // link). Adjusted during render rather than in an effect, which would be a
  // cascading render.
  const [syncedQ, setSyncedQ] = useState(currentQ);
  if (currentQ !== syncedQ) {
    setSyncedQ(currentQ);
    setSearch(currentQ);
  }

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

  const setStatus = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("status");
    else params.set("status", value);
    params.delete("page");
    startTransition(() => router.replace(`?${params.toString()}`));
  };

  const current = searchParams.get("status") ?? "all";

  return (
    <div className="flex flex-col gap-8" data-pending={isPending || undefined}>
      <Field
        className="border-primary bg-accent w-full border-b p-2 sm:w-96"
        orientation="horizontal"
      >
        <Input
          className="focus-visible:border-input focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={search}
          placeholder="Search by order number, name or phone…"
          aria-label="Search orders"
          onChange={(event) => setSearch(event.target.value)}
        />
        <Search />
      </Field>

      <Tabs value={current} onValueChange={setStatus}>
        <TabsList variant="line" className="overflow-x-auto">
          <TabsTrigger
            value="all"
            className="min-w-fit text-sm whitespace-nowrap md:text-base"
          >
            All
            {counts.all > 0 && (
              <span className="text-muted-foreground ml-1.5">
                ({counts.all})
              </span>
            )}
          </TabsTrigger>
          {ADMIN_SETTABLE_STATUSES.map((status) => (
            <TabsTrigger
              key={status}
              value={status}
              className="min-w-fit text-sm whitespace-nowrap md:text-base"
            >
              {status}
              {counts[status] > 0 && (
                <span className="text-muted-foreground ml-1.5">
                  ({counts[status]})
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
