"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
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
import { emptyFormState } from "@/features/admin/lib/form-state";
import { deleteCustomer } from "@/features/admin/lib/customer-actions";

/**
 * The delete control for one row of the customer register.
 *
 * The one destructive action in the admin panel, so the dialog spells out both
 * halves of what happens: the account goes for good, and the orders don't. An
 * admin who deletes someone needs to know their order history is still there
 * before they click, not after.
 *
 * Rendering this at all is not the access control: deleteCustomer calls
 * requireAdmin() as its first statement, because a Server Action is reachable
 * by direct POST whether or not anything rendered it (D6). The same goes for
 * the active-order guard — it lives in the action, and a refusal comes back as
 * an error toast with the dialog left open rather than an override.
 */
export default function DeleteCustomerDialog({
  userId,
  name,
  email,
  orderCount,
  isSelf,
}: {
  userId: string;
  name: string;
  email: string;
  /** Orders that survive the delete — shown so the admin knows what stays. */
  orderCount: number;
  /** True for the signed-in admin's own row. */
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    deleteCustomer,
    emptyFormState,
  );
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

  if (isSelf) {
    return (
      <Button
        size="sm"
        variant="ghost"
        disabled
        aria-label="You can't delete your own account"
        title="You can't delete your own account — ask another admin."
      >
        <Trash2 className="size-4" />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>
            This permanently erases {email} — the account, its sign-in sessions
            and its saved cart. It cannot be undone, and there is no way to
            restore it.
          </DialogDescription>
        </DialogHeader>

        <div className="border-border bg-muted/50 border p-4 text-sm">
          {orderCount > 0 ? (
            <p className="text-muted-foreground">
              <span className="text-foreground">
                {orderCount} order{orderCount === 1 ? "" : "s"}
              </span>{" "}
              stay on the books, keeping the name, phone and delivery address
              recorded at checkout — you&apos;ll still have everything a return
              or a courier dispute needs.
            </p>
          ) : (
            <p className="text-muted-foreground">
              This account has never placed an order.
            </p>
          )}
        </div>

        <form action={formAction}>
          <input type="hidden" name="userId" value={userId} />

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
                  Deleting…
                </>
              ) : (
                "Delete permanently"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
