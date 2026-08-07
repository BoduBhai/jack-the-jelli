"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ROLE_COPY,
  USER_ROLES,
  type UserRole,
} from "@/features/admin/lib/roles";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Search and role filtering live in the URL, so the customers page stays a
 * Server Component and Mongo does the work — the same arrangement as
 * OrderFilters. Every change resets to page 1, or you can land on page 4 of a
 * two-page result.
 */
export default function CustomerFilters({
  counts,
}: {
  counts: Record<UserRole | "all", number>;
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

  const setRole = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("role");
    else params.set("role", value);
    params.delete("page");
    startTransition(() => router.replace(`?${params.toString()}`));
  };

  const current = searchParams.get("role") ?? "all";

  return (
    <div className="flex flex-col gap-8" data-pending={isPending || undefined}>
      <Field
        className="border-primary bg-accent w-full border-b p-2 sm:w-96"
        orientation="horizontal"
      >
        <Input
          className="focus-visible:border-input focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={search}
          placeholder="Search by name, email or phone…"
          aria-label="Search customers"
          onChange={(event) => setSearch(event.target.value)}
        />
        <Search />
      </Field>

      <Tabs value={current} onValueChange={setRole}>
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
          {USER_ROLES.map((role) => (
            <TabsTrigger
              key={role}
              value={role}
              className="min-w-fit text-sm whitespace-nowrap md:text-base"
            >
              {/* Pluralised: the tab names a group, not one person's role. */}
              {ROLE_COPY[role]}s
              {counts[role] > 0 && (
                <span className="text-muted-foreground ml-1.5">
                  ({counts[role]})
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
