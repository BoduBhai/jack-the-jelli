/**
 * The single choke point for privileged operations (D6).
 *
 * Server Actions and route handlers are reachable by direct POST from anyone on
 * the internet — rendering a page under /admin protects nothing. Every admin
 * action and admin route handler calls this as its FIRST statement.
 *
 * Real JWT auth arrives in Phase 4. Until then this refuses to run anywhere but
 * a dev machine, so the create/update endpoints can't be driven against a
 * production database. When Phase 4 lands, only this file changes: read the
 * HTTP-only cookie, verify the JWT, check `role === "admin"`.
 *
 * ⚠️ Do not deploy to production before Phase 4 auth exists.
 */
export async function requireAdmin(): Promise<void> {
  // TODO(phase-4): verify the JWT cookie and the user's admin role instead.
  if (process.env.NODE_ENV !== "development") {
    throw new Error(
      "Admin authentication is not implemented yet (Phase 4). Refusing to run a privileged operation outside development.",
    );
  }
}
