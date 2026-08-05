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

/**
 * `intendedPath` exists because proxy.ts only sees the session *cookie*. A
 * revoked or expired session still carries one, so the request sails past the
 * proxy and dies here instead — and without this the user is dropped on /login
 * having silently lost where they were going. Server Components have no way to
 * read their own pathname, so the caller supplies it.
 */
function loginPath(intendedPath?: string) {
  if (!intendedPath) return "/login";
  return `/login?redirect=${encodeURIComponent(intendedPath)}`;
}

export async function requireAuth(intendedPath?: string) {
  const session = await getSession();
  if (!session) redirect(loginPath(intendedPath));
  return session;
}

export async function requireAdmin(intendedPath?: string) {
  const session = await getSession();
  if (!session) redirect(loginPath(intendedPath));

  // new ObjectId() throws BSONError on anything that isn't 24 hex characters,
  // which would surface as a 500 from a guard whose whole job is to answer
  // yes/no. Treat an unparseable id the same as a non-admin.
  if (!ObjectId.isValid(session.user.id)) redirect("/");

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
