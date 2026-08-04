import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUsersCollection } from "@/lib/users";

/**
 * The single choke point for privileged operations (D6).
 *
 * Server Actions and route handlers are reachable by direct POST from anyone on
 * the internet — rendering a page under /admin protects nothing. Every admin
 * action and admin route handler calls requireAdmin() as its FIRST statement.
 */

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");

  const users = await getUsersCollection();
  // §3.3: role is re-read from the database on every call, never trusted from
  // the session token, so revoking admin takes effect on the next request.
  //
  // Better Auth's MongoDB adapter stores `_id` as a native ObjectId even
  // though `session.user.id` is exposed as a string on the client — querying
  // with the raw string silently matches zero documents.
  const user = await users.findOne({ _id: new ObjectId(session.user.id) });
  if (user?.role !== "admin") redirect("/");
  return user;
}
