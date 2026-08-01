import type { ZodError } from "zod";

/**
 * Shared return shape for every admin Server Action, so `useActionState` can
 * render field errors and refill the form after a failed submit.
 *
 * Lives outside the action files because a `"use server"` module may only
 * export async functions.
 */
export interface AdminFormState {
  ok: boolean;
  /** Keyed by form field name. */
  errors?: Record<string, string>;
  /** Raw submitted strings, echoed back so nothing typed gets wiped. */
  values?: Record<string, string>;
  /** Form-level message (unexpected failure, or a summary). */
  message?: string;
}

export const emptyFormState: AdminFormState = { ok: false };

/** First issue per top-level field — one message under each input. */
export function toFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || key in errors) continue;
    errors[key] = issue.message;
  }
  return errors;
}

/** Pull the plain string entries out of FormData for the `values` echo. */
export function collectValues(
  formData: FormData,
  fields: readonly string[],
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields) {
    const value = formData.get(field);
    if (typeof value === "string") values[field] = value;
  }
  return values;
}
