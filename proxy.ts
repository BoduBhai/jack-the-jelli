import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// §3.4: cookie-presence redirect only — no DB queries, no token verification,
// no role checks. Real enforcement (including the admin role check) lives in
// Server Components and Server Actions, since a role can't be read here
// without a database call.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (sessionCookie) return;

  const loginUrl = new URL("/login", request.url);
  // Without this the sign-in always lands on the homepage, so a deep link to
  // /admin/products/<id> silently loses its destination. Read back through
  // safeRedirectPath on the login page — never trusted as-is.
  loginUrl.searchParams.set(
    "redirect",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/account/:path*", "/checkout", "/admin/:path*"],
};
