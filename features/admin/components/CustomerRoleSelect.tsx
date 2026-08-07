"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
 * Picking a value submits immediately — there's no "choose, then save" second
 * step, so nothing on screen can disagree with what the server holds. The
 * select shows the chosen role while the action is in flight and snaps back to
 * the server's value if it's refused.
 *
 * Rendering this at all is not the access control: updateUserRole calls
 * requireAdmin() as its first statement, because a Server Action is reachable
 * by direct POST whether or not anything rendered it (D6).
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

  // Derived rather than stored, so nothing has to put the control back by hand.
  // The optimistic value shows only while the action is in flight; the moment
  // it settles the prop is the single source of truth again — freshly
  // revalidated if the change was accepted, unchanged if it was refused. A
  // stored value would need a setState in an effect to undo a refusal, which is
  // exactly the cascading render this avoids.
  const value = pending && submitted ? submitted : role;

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
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
          setSubmitted(chosen);
          // useActionState's dispatch is already wrapped in a transition, so
          // it can be called straight from the handler with its own payload.
          const formData = new FormData();
          formData.set("userId", userId);
          formData.set("role", chosen);
          formAction(formData);
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
    </div>
  );
}
