import { z } from "zod";

// Client-side validation only, for instant feedback — Better Auth's
// updateUser endpoint is the authoritative check on the server.
export const accountSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export type AccountInput = z.infer<typeof accountSchema>;
