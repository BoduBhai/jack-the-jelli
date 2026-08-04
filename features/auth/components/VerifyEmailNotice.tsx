"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import {
  boxedInputClassName,
  fieldLabelClassName,
} from "@/features/auth/lib/auth-form";

interface VerifyEmailNoticeProps {
  email?: string;
  error?: string;
}

export default function VerifyEmailNotice({
  email: initialEmail,
  error,
}: VerifyEmailNoticeProps) {
  const { data: session } = authClient.useSession();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isVerified = session?.user?.emailVerified === true;

  async function handleResend(event: React.FormEvent) {
    event.preventDefault();
    if (!email) {
      setFormError("Enter your email to resend the link.");
      return;
    }
    setIsPending(true);
    setFormError(null);

    const { error: resendError } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/verify-email",
    });

    setIsPending(false);

    if (resendError) {
      setFormError(
        resendError.message ?? "Couldn't resend the email. Try again.",
      );
      return;
    }

    setSent(true);
  }

  if (isVerified) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 text-center">
        <h1 className="font-heading text-3xl tracking-widest">
          Email Verified
        </h1>
        <p className="text-muted-foreground text-sm">
          Your account is ready. Welcome to Jack The Jelli.
        </p>
        <Button
          asChild
          className="h-12 rounded-none text-sm tracking-widest uppercase"
        >
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 text-center">
      <h1 className="font-heading text-3xl tracking-widest">
        {error ? "Link Expired" : "Check Your Email"}
      </h1>
      <p className="text-muted-foreground text-sm">
        {error
          ? "That verification link is invalid or has expired. Enter your email to get a new one."
          : initialEmail
            ? `We sent a verification link to ${initialEmail}. Click it to activate your account.`
            : "We sent a verification link to your email. Click it to activate your account."}
      </p>

      {sent ? (
        <p className="text-sm">Verification email sent — check your inbox.</p>
      ) : (
        <form onSubmit={handleResend} className="flex flex-col gap-4 text-left">
          {(error || !initialEmail) && (
            <Field>
              <FieldLabel htmlFor="resend-email" className={fieldLabelClassName}>
                Email
              </FieldLabel>
              <Input
                id="resend-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@example.com"
                className={boxedInputClassName}
              />
            </Field>
          )}
          {formError && (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="h-12 rounded-none text-sm tracking-widest uppercase"
          >
            {isPending ? "Sending…" : "Resend Verification Email"}
          </Button>
        </form>
      )}

      <p className="text-muted-foreground text-sm">
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
