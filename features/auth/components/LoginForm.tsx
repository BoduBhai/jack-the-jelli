"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import GoogleButton from "@/features/auth/components/GoogleButton";
import { loginSchema } from "@/features/auth/lib/auth-schema";
import {
  boxedInputClassName,
  fieldLabelClassName,
} from "@/features/auth/lib/auth-form";

type FieldErrors = Partial<Record<"email" | "password", string>>;

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_linked:
    "An account with this email already exists. Sign in with your password to connect Google.",
};

interface LoginFormProps {
  oauthError?: string;
}

export default function LoginForm({ oauthError }: LoginFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(
    oauthError
      ? (OAUTH_ERROR_MESSAGES[oauthError] ??
          "Google sign-in failed. Please try again.")
      : null,
  );
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "pending" | "sent">(
    "idle",
  );
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setUnverifiedEmail(null);
    setResendState("idle");

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsPending(true);

    const { error } = await authClient.signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    setIsPending(false);

    if (error) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(parsed.data.email);
        setFormError(
          "Verify your email before signing in — check your inbox for the link we sent when you registered.",
        );
        return;
      }
      setFormError(error.message ?? "Sign in failed. Please try again.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleResend() {
    if (!unverifiedEmail) return;
    setResendState("pending");
    const { error } = await authClient.sendVerificationEmail({
      email: unverifiedEmail,
      callbackURL: "/verify-email",
    });
    if (error) {
      setResendState("idle");
      setFormError(
        error.message ?? "Couldn't resend the email. Please try again.",
      );
      return;
    }
    setResendState("sent");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-8"
    >
      <header className="border-border border-b pb-6">
        <h1 className="font-heading text-3xl tracking-widest">Sign In</h1>
        {formError && (
          <p role="alert" className="text-destructive mt-4 text-sm" aria-live="polite">
            {formError}
          </p>
        )}
        {unverifiedEmail && (
          <div className="mt-3">
            {resendState === "sent" ? (
              <p className="text-sm">Verification email sent — check your inbox.</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendState === "pending"}
                className="text-foreground text-sm underline underline-offset-4"
              >
                {resendState === "pending"
                  ? "Sending…"
                  : "Resend verification email"}
              </button>
            )}
          </div>
        )}
      </header>

      <div className="flex flex-col gap-6">
        <Field data-invalid={Boolean(errors.email) || undefined}>
          <FieldLabel htmlFor="email" className={fieldLabelClassName}>
            Email
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            placeholder="jane@example.com"
            className={boxedInputClassName}
          />
          <FieldError>{errors.email}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.password) || undefined}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password" className={fieldLabelClassName}>
              Password
            </FieldLabel>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            placeholder="Your password"
            className={boxedInputClassName}
          />
          <FieldError>{errors.password}</FieldError>
        </Field>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 rounded-none text-sm tracking-widest uppercase"
      >
        {isPending ? "Signing In…" : "Sign In"}
      </Button>

      <div className="flex items-center gap-4">
        <div className="border-border h-px flex-1 border-t" />
        <span className="text-muted-foreground text-xs tracking-widest uppercase">
          Or
        </span>
        <div className="border-border h-px flex-1 border-t" />
      </div>

      <GoogleButton />

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground underline underline-offset-4">
          Create one
        </Link>
      </p>
    </form>
  );
}
