"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  emptyFormState,
  type AdminFormState,
} from "@/features/admin/lib/form-state";

/**
 * The confirmation behind the two moves that settle an order for good —
 * cancelling and returning.
 *
 * Both are one-way and both touch stock, which is why they're deliberately not
 * in the one-click status row above: the row is for corrections, this is for
 * decisions. `restock` is the only thing that differs between them, so it comes
 * in as an optional slot rather than forking the component.
 */
export default function OrderSettleDialog({
  orderNumber,
  action,
  trigger,
  title,
  description,
  confirmLabel,
  notePlaceholder,
  extraFields,
}: {
  orderNumber: string;
  action: (
    state: AdminFormState,
    formData: FormData,
  ) => Promise<AdminFormState>;
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  notePlaceholder: string;
  /** Rendered inside the form — the return dialog's restock checkbox. */
  extraFields?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, emptyFormState);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      // Held open briefly so the confirmation is visible before it closes.
      const timer = setTimeout(() => setOpen(false), 700);
      return () => clearTimeout(timer);
    }
    toast.error(state.message);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5 py-2">
          <input type="hidden" name="orderNumber" value={orderNumber} />

          <div className="space-y-2">
            <Label
              htmlFor={`note-${orderNumber}`}
              className="text-muted-foreground text-xs font-semibold tracking-widest uppercase"
            >
              Reason (optional)
            </Label>
            <Textarea
              id={`note-${orderNumber}`}
              name="note"
              rows={2}
              maxLength={200}
              placeholder={notePlaceholder}
              className="rounded-none"
            />
            <p className="text-muted-foreground/60 text-xs">
              Kept on the order&apos;s history.
            </p>
          </div>

          {extraFields}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Never mind
              </Button>
            </DialogClose>
            <Button
              size="sm"
              type="submit"
              variant="destructive"
              disabled={pending}
              className="rounded-none"
            >
              {pending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
