"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { getUsersCollection } from "@/lib/users";
import type { AdminFormState } from "@/features/admin/lib/form-state";
import { ROLE_COPY, USER_ROLES } from "@/features/admin/lib/roles";

const roleInputSchema = z.object({
  userId: z
    .string()
    .trim()
    // new ObjectId() throws BSONError on anything that isn't 24 hex
    // characters, which would surface as a 500 from a validation failure.
    .refine((value) => ObjectId.isValid(value), "Unknown account"),
  role: z.enum(USER_ROLES),
});

/**
 * Grant or revoke admin.
 *
 * The one place `role` is ever written. Better Auth's `additionalFields` entry
 * marks it `input: false` (lib/auth.ts), so sign-up and update-user can't touch
 * it — which makes this action, behind requireAdmin(), the whole surface.
 *
 * No session revocation is needed on a demotion: requireAdmin() re-reads the
 * role from the database on every call (§3.3) rather than trusting the session
 * token, so the change lands on the demoted user's very next request.
 */
export async function updateUserRole(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();

  const parsed = roleInputSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false, message: "That role change isn't valid." };
  }

  const { userId, role } = parsed.data;

  // Self-demotion is the one change nobody can undo from this screen — it
  // takes effect on the next request, which is the one that redirects them off
  // /admin. It also means the last remaining admin can never be demoted, since
  // they're the only person who can reach this page at all.
  if (userId === String(admin._id)) {
    return {
      ok: false,
      message: "You can't change your own role — ask another admin.",
    };
  }

  let name: string;

  try {
    const users = await getUsersCollection();

    // mongodb v7 returns the document itself, not a { value } wrapper.
    const updated = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { role, updatedAt: new Date() } },
      { returnDocument: "after", projection: { name: 1, email: 1 } },
    );

    if (!updated) {
      return { ok: false, message: "That account no longer exists." };
    }

    name = updated.name?.trim() || updated.email;
  } catch (error) {
    console.error("updateUserRole failed", error);
    return {
      ok: false,
      message: "Something went wrong updating this account.",
    };
  }

  revalidatePath("/admin/customers");
  return {
    ok: true,
    message: `${name} is now ${role === "admin" ? "an" : "a"} ${ROLE_COPY[role].toLowerCase()}.`,
  };
}
