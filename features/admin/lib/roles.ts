// The two roles the app knows about, in one place.
//
// `role` is a Better Auth `additionalFields` entry with `input: false`
// (lib/auth.ts), so it can never be self-assigned through sign-up or
// update-user — it only ever changes through updateUserRole in
// customer-actions.ts, which is guarded by requireAdmin().
//
// Deliberately free of any server-only import: CustomerFilters and
// CustomerRoleSelect are client components and render straight from these.

export const USER_ROLES = ["customer", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_COPY: Record<UserRole, string> = {
  customer: "Customer",
  admin: "Admin",
};

/**
 * Accounts created before `role` had a `defaultValue` carry no field at all,
 * and anything that isn't literally "admin" is not an admin — so unknown
 * values fall back to the least privileged role rather than being trusted.
 */
export function normalizeRole(value: string | undefined | null): UserRole {
  return value === "admin" ? "admin" : "customer";
}
