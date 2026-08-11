"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  emptyFormState,
  type AdminFormState,
} from "@/features/admin/lib/form-state";

export interface StatusOption {
  value: string;
  label: string;
}

/**
 * One row of the Delivery & Payment panel: every option on screen at once, one
 * click to apply.
 *
 * Each button is its own submitter carrying `name`/`value`, which React 19 puts
 * into the FormData — so there's no "pick, then save" second step and no
 * selection state that could disagree with what the server actually holds. The
 * current option is inert rather than hidden, because the row doubles as the
 * display of where the order stands — and inert via `aria-disabled` rather than
 * `disabled` for the same reason, so keyboard users can still reach the readout.
 */
export default function StatusButtonRow({
  label,
  field,
  orderNumber,
  options,
  current,
  action,
  isDisabled,
  hint,
}: {
  label: string;
  /** FormData key the chosen value is submitted under. */
  field: string;
  orderNumber: string;
  options: readonly StatusOption[];
  current: string;
  action: (
    state: AdminFormState,
    formData: FormData,
  ) => Promise<AdminFormState>;
  /** Options the state machine won't accept from here. */
  isDisabled?: (value: string) => boolean;
  hint?: string;
}) {
  const [state, formAction, pending] = useActionState(action, emptyFormState);
  // Which button was clicked, so the spinner lands on that one rather than all
  // of them. Never cleared: it only ever reads alongside `pending`, so a stale
  // value shows nothing once the submit has finished.
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="border-border space-y-3 border p-4">
      <input type="hidden" name="orderNumber" value={orderNumber} />

      <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isCurrent = option.value === current;

          return (
            <Button
              key={option.value}
              type="submit"
              name={field}
              value={option.value}
              size="sm"
              variant={isCurrent ? "secondary" : "outline"}
              aria-pressed={isCurrent}
              // Inert, but never `disabled`: this is the button that says where
              // the order stands, so it has to stay in the tab order.
              aria-disabled={isCurrent}
              disabled={pending || isDisabled?.(option.value)}
              onClick={(event) => {
                // Nothing removes the current option from the form, so the
                // keyboard path has to be turned away here.
                if (isCurrent) {
                  event.preventDefault();
                  return;
                }
                setSubmitting(option.value);
              }}
              className={cn(
                "rounded-none tracking-wider uppercase",
                // Dead to the mouse the way `disabled` was, and the one thing
                // here that must not look faded while a sibling submits.
                isCurrent &&
                  "disabled:opacity-100 aria-disabled:pointer-events-none",
              )}
            >
              {submitting === option.value && pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : isCurrent ? (
                <Check className="size-3.5" />
              ) : null}
              {option.label}
            </Button>
          );
        })}
      </div>

      {hint && <p className="text-muted-foreground/60 text-xs">{hint}</p>}
    </form>
  );
}
