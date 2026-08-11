"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { emptyFormState } from "@/features/admin/lib/form-state";
import { updateUserRole } from "@/features/admin/lib/customer-actions";
import {
  ROLE_COPY,
  USER_ROLES,
  type UserRole,
} from "@/features/admin/lib/roles";

/**
 * The role editor for one row.
 *
 * The two directions are not the same move, so they don't get the same
 * treatment. Demoting an admin submits on the spot — it's one click to undo and
 * it can't strand the store, since updateUserRole refuses self-changes and so
 * the last admin can never remove themselves. Promoting hands over orders,
 * inventory, customer deletion and the power to promote further admins, which
 * is too much to sit one stray click away in a table row, so it goes through a
 * confirmation first.
 *
 * Neither the dialog nor rendering this at all is the access control:
 * updateUserRole calls requireAdmin() as its first statement, because a Server
 * Action is reachable by direct POST whether or not anything rendered it (D6).
 * The dialog is here to slow a person down, not to stop a request.
 */
export default function CustomerRoleSelect({
  userId,
  name,
  role,
  isSelf,
}: {
  userId: string;
  /** For the aria-label, so the control names *whose* role it changes. */
  name: string;
  role: UserRole;
  /** True for the signed-in admin's own row — the one change they can't undo. */
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateUserRole,
    emptyFormState,
  );
  const [submitted, setSubmitted] = useState<UserRole | null>(null);
  // The role waiting on a confirmation — only ever "admin". Doubles as the
  // dialog's open state, so there's no second flag to keep in step with it.
  const [confirming, setConfirming] = useState<UserRole | null>(null);

  // Derived rather than stored, so nothing has to put the control back by hand.
  // The optimistic value shows only while the action is in flight; the moment
  // it settles the prop is the single source of truth again — freshly
  // revalidated if the change was accepted, unchanged if it was refused. A
  // stored value would need a setState in an effect to undo a refusal, which is
  // exactly the cascading render this avoids.
  const value = pending && submitted ? submitted : role;

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      // Held open briefly so the confirmation is visible before it closes. A
      // no-op on the demote path, which never opened a dialog.
      const timer = setTimeout(() => setConfirming(null), 700);
      return () => clearTimeout(timer);
    }
    // Left open on a refusal, so what was turned down stays on screen.
    toast.error(state.message);
  }, [state]);

  if (isSelf) {
    return (
      <span
        className="text-muted-foreground border-border inline-block border border-dashed px-2 py-1 text-xs font-semibold tracking-widest uppercase"
        title="You can't change your own role — ask another admin."
      >
        {ROLE_COPY[role]} (you)
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        disabled={pending}
        onValueChange={(next) => {
          const chosen = next as UserRole;
          if (chosen === role) return;

          if (chosen === "admin") {
            setConfirming("admin");
            return;
          }

          setSubmitted(chosen);
          // Only a `form action` / `formAction` prop gets an implicit
          // transition from react-dom, so a hand-rolled dispatch has to supply
          // its own — without it `pending` never turns true and the spinner and
          // the disabled lock below are dead code.
          const formData = new FormData();
          formData.set("userId", userId);
          formData.set("role", chosen);
          startTransition(() => formAction(formData));
        }}
      >
        <SelectTrigger
          className="w-36"
          aria-label={`Change role for ${name}`}
          data-pending={pending || undefined}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {USER_ROLES.map((option) => (
              <SelectItem key={option} value={option}>
                {ROLE_COPY[option]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {pending && (
        <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" />
      )}

      {/* Opened by the select rather than a button, so there's no trigger. */}
      <Dialog
        open={confirming !== null}
        onOpenChange={(next) => {
          if (!next) setConfirming(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make {name} an admin?</DialogTitle>
            <DialogDescription>
              Admins reach the whole dashboard — every order, the full
              inventory, and the customer register, where they can delete
              accounts and make other people admins too.
            </DialogDescription>
          </DialogHeader>

          <div className="border-border bg-muted/50 border p-4 text-sm">
            <p className="text-muted-foreground">
              Any admin can undo this by setting the role back to customer —
              though by then {name} will have had the run of the dashboard.
            </p>
          </div>

          {/* A real form, so react-dom wraps the dispatch in a transition. */}
          <form action={formAction} onSubmit={() => setSubmitted("admin")}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="role" value="admin" />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm">
                  Never mind
                </Button>
              </DialogClose>
              <Button
                size="sm"
                type="submit"
                disabled={pending}
                className="rounded-none"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Granting…
                  </>
                ) : (
                  "Grant admin access"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
