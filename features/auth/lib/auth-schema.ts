import { z } from "zod";

// Client-side validation only, for instant feedback — Better Auth is the
// authoritative check on the server. Keep these in sync with its config
// (minPasswordLength defaults to 8) rather than trusting this alone.

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // Optional at registration, required later at checkout — see
  // AUTH_IMPLEMENTATION_PLAN.md §2.
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
