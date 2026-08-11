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
          placeholder="Search by name, email or phone…"
          aria-label="Search customers"
          onChange={(event) => setSearch(event.target.value)}
        />
        <Search />
      </Field>

      <Field className="border-primary w-48 border-b p-2">
        <Select value={current} onValueChange={setRole}>
          <SelectTrigger aria-label="Filter by role">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">
                All Roles
                {counts.all > 0 && (
                  <span className="text-muted-foreground">({counts.all})</span>
                )}
              </SelectItem>
              {USER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {/* Pluralised: the option names a group, not one person's
                      role. */}
                  {ROLE_COPY[role]}s
                  {counts[role] > 0 && (
                    <span className="text-muted-foreground">
                      ({counts[role]})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
