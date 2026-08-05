const FALLBACK = "/";

// Only used to give the WHATWG parser an origin to resolve against; the origin
// itself is thrown away, so the literal value is arbitrary.
const RESOLUTION_BASE = "http://redirect.invalid";

// The auth pages themselves: redirect=/login would loop straight back here.
const AUTH_PATHS =
  /^\/(login|register|forgot-password|reset-password|verify-email)(\/|$)/;

/**
 * Narrows a `?redirect=` value down to a same-origin path before anything
 * navigates to it. The parameter is attacker-controllable — a phishing link to
 * `/login?redirect=https://evil.example` would otherwise turn this app's own
 * sign-in page into an open redirect.
 *
 * Parsing against a throwaway base and re-serialising from `pathname`/`search`
 * does the narrowing in one step: a protocol-relative `//evil.example` (and the
 * `/\evil.example` variant browsers normalise to it) lands on a different
 * origin and is rejected, and tab/newline smuggling can't survive the round
 * trip because the parser strips those before they reach `pathname`.
 */
export function safeRedirectPath(value: string | undefined | null): string {
  if (!value || !value.startsWith("/")) return FALLBACK;

  let url: URL;
  try {
    url = new URL(value, RESOLUTION_BASE);
  } catch {
    return FALLBACK;
  }
  if (url.origin !== RESOLUTION_BASE) return FALLBACK;

  const path = `${url.pathname}${url.search}`;
  return AUTH_PATHS.test(url.pathname) ? FALLBACK : path;
}
