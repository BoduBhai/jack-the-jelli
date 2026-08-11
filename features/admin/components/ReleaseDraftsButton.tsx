"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { releaseStaleDrafts } from "@/features/admin/lib/order-actions";

/**
 * The stale-Draft sweep, run by hand.
 *
 * A Draft is created before stock is decremented and flipped to Pending after,
 * so a crash in that window leaves one holding units for an order nobody
 * placed. A cron job or a queue would clear them automatically and cost money
 * every month; a button that only appears when there is something to clear
 * costs nothing.
 */
export default function ReleaseDraftsButton({ count }: { count: number }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (count === 0 || done) return null;

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await releaseStaleDrafts();
          if (result.ok) {
            setDone(true);
            toast.success(result.message ?? "Released.");
          } else {
            toast.error(result.message ?? "Could not release the drafts.");
          }
        })
      }
      className="border-border text-muted-foreground hover:text-foreground rounded-none bg-transparent text-xs tracking-widest uppercase"
    >
      {isPending
        ? "Releasing…"
        : `Release ${count} held draft${count === 1 ? "" : "s"}`}
    </Button>
  );
}
