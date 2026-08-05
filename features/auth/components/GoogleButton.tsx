"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface GoogleButtonProps {
  /** Already narrowed by safeRedirectPath — Better Auth rejects off-origin. */
  callbackURL?: string;
}

export default function GoogleButton({ callbackURL = "/" }: GoogleButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    // On success this redirects the browser to Google — it never resolves
    // normally on the happy path. On failure Better Auth redirects back to
    // errorCallbackURL with ?error=<code> instead of rejecting this call.
    await authClient.signIn.social({
      provider: "google",
      callbackURL,
      errorCallbackURL: "/login",
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={handleClick}
      className="h-12 w-full gap-3 rounded-none text-sm tracking-widest uppercase"
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.41 3.63v3.02h3.9c2.28-2.1 3.6-5.19 3.6-8.84Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.9-3.02c-1.08.73-2.46 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.28v3.11C3.26 21.3 7.31 24 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.31 14.31A7.2 7.2 0 0 1 4.93 12c0-.8.14-1.58.38-2.31V6.58H1.28A11.95 11.95 0 0 0 0 12c0 1.93.46 3.76 1.28 5.42l4.03-3.11Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.58l4.03 3.11C6.25 6.87 8.89 4.77 12 4.77Z"
        />
      </svg>
      {isPending ? "Redirecting…" : "Continue with Google"}
    </Button>
  );
}
