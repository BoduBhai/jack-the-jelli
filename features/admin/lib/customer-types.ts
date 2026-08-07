import type { UserRole } from "@/features/admin/lib/roles";

/**
 * Serializable customer for client components.
 *
 * Better Auth owns the `user` collection, so these come out of the raw MongoDB
 * driver rather than a Mongoose model — but the same boundary rule applies
 * (§6.3): `_id` and `Date` don't survive the server/client hop, so every query
 * maps through `toCustomerDTO` in features/admin/lib/customers.ts.
 *
 * Kept in its own file, free of any driver import, so CustomerRoleSelect can
 * pull the type without `mongodb` following it into the bundle.
 */
export interface CustomerDTO {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  /** As the customer typed it on their account page — may be any BD format. */
  phone?: string;
  /** Google avatar for social sign-ups; absent for password accounts. */
  image?: string;
  role: UserRole;
  /** ISO string, or "" for accounts predating the adapter's timestamps. */
  joinedAt: string;
  /** Orders placed while signed in — see the note on guests in customers.ts. */
  orderCount: number;
  /** Sum of every order that wasn't cancelled or returned. */
  lifetimeValue: number;
  /** ISO string. Absent when the account has never ordered. */
  lastOrderAt?: string;
}
