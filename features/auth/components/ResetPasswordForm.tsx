"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import {
  boxedInputClassName,
  fieldLabelClassName,
} from "@/features/auth/lib/auth-form";

interface ResetPasswordFormProps {
  token?: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (!token) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 text-center">
        <h1 className="font-heading text-3xl tracking-widest">
          Invalid Reset Link
        </h1>
        <p className="text-muted-foreground text-sm">
          This password reset link is missing or malformed. Request a new one.
        </p>
        <Button
          asChild
          className="h-12 rounded-none text-sm tracking-widest uppercase"
        >
          <Link href="/forgot-password">Request New Link</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsPending(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword,
      token,
    });
    setIsPending(false);

    if (resetError) {
      setError(
        resetError.message ??
          "This link is invalid or has expired. Request a new one.",
      );
      return;
    }

    router.push("/login");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-8"
    >
      <header className="border-border border-b pb-6">
        <h1 className="font-heading text-3xl tracking-widest">
          Reset Password
        </h1>
        {error && (
          <p role="alert" className="text-destructive mt-4 text-sm" aria-live="polite">
            {error}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-6">
        <Field>
          <FieldLabel htmlFor="password" className={fieldLabelClassName}>
            New Password
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={boxedInputClassName}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword" className={fieldLabelClassName}>
            Confirm Password
          </FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            className={boxedInputClassName}
          />
        </Field>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 rounded-none text-sm tracking-widest uppercase"
      >
        {isPending ? "Resetting…" : "Reset Password"}
      </Button>
    </form>
  );
}
