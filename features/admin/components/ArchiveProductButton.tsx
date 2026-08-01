"use client";

import { useActionState, useState } from "react";
import { Loader2, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  archiveProduct,
  restoreProduct,
} from "@/features/admin/lib/product-actions";
import { emptyFormState } from "@/features/admin/lib/form-state";
import type { ProductStatus } from "@/features/admin/lib/types";

interface ArchiveProductButtonProps {
  productId: string;
  productName: string;
  status: ProductStatus;
}

/**
 * Archiving is a soft-delete (see product-actions.ts) — the row is never
 * removed, so a restore is always possible and never needs confirmation.
 * Archiving does hide the product from the default admin list, so it gets a
 * one-click confirm step, same UX as CategoryManagerDialog's inline confirm.
 */
export default function ArchiveProductButton({
  productId,
  productName,
  status,
}: ArchiveProductButtonProps) {
  const isArchived = status === "Archived";
  const [state, formAction, isPending] = useActionState(
    isArchived ? restoreProduct : archiveProduct,
    emptyFormState,
  );
  const [confirming, setConfirming] = useState(false);

  if (isArchived) {
    return (
      <form action={formAction}>
        <input type="hidden" name="id" value={productId} />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label={`Restore ${productName}`}
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground rounded-none"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RotateCcw className="size-4" />
          )}
        </Button>
      </form>
    );
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Archive ${productName}`}
        onClick={() => setConfirming(true)}
        className="text-muted-foreground hover:text-destructive rounded-none"
      >
        <Trash2 className="size-4" />
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex items-center justify-center gap-1"
    >
      <input type="hidden" name="id" value={productId} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={isPending}
        className="rounded-none text-xs tracking-widest uppercase"
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Confirm"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Cancel archive"
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="rounded-none"
      >
        <X className="size-4" />
      </Button>
      {state.message && !state.ok && (
        <p role="alert" className="text-destructive ml-2 text-xs">
          {state.message}
        </p>
      )}
    </form>
  );
}
