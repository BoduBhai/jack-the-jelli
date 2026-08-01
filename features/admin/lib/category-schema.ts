import { z } from "zod";
import type { AdminFormState } from "@/features/admin/lib/form-state";
import { OBJECT_ID_PATTERN } from "@/features/admin/lib/product-schema";

export const CATEGORY_VALUE_FIELDS = ["name", "description"] as const;

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name is required")
    .max(60, "Category name cannot exceed 60 characters"),
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().trim().regex(OBJECT_ID_PATTERN, "Unknown category"),
});

export const deleteCategorySchema = z.object({
  id: z.string().trim().regex(OBJECT_ID_PATTERN, "Unknown category"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export function readCategoryFormData(formData: FormData) {
  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : undefined;
  };

  return {
    id: get("id") ?? "",
    name: get("name") ?? "",
    description: get("description"),
  };
}

/** Serializable option used by the product forms' category <Select>. */
export interface CategoryOption {
  id: string;
  name: string;
}

/**
 * Category actions echo back the row they touched so the dialog can select a
 * just-created category without waiting for the refreshed server props.
 *
 * Declared here rather than in category-actions.ts because a `"use server"`
 * module may only export async functions.
 */
export interface CategoryActionState extends AdminFormState {
  category?: CategoryOption;
}

export const emptyCategoryActionState: CategoryActionState = { ok: false };
