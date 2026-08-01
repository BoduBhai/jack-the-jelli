"use client";

import { useState } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CategoryManagerDialog from "@/features/admin/components/CategoryManagerDialog";
import type { CategoryOption } from "@/features/admin/lib/category-schema";
import { fieldLabelClassName } from "@/features/admin/lib/product-form";

interface CategorySelectProps {
  /** Loaded from MongoDB server-side — categories are data, never an enum (D7). */
  categories: CategoryOption[];
  defaultValue?: string;
  error?: string;
  /** Field styling differs between the create form (boxed) and edit form (underline). */
  triggerClassName?: string;
  onDirty?: () => void;
}

/**
 * Category picker plus inline management. Shared by the create and edit product
 * forms so a category added from either one is immediately selectable.
 *
 * Required-ness is enforced by zod in the Server Action ("Select a category"),
 * not by Radix's `required` — that applies to a visually-hidden native select,
 * which browsers refuse to focus when reporting validity.
 */
export default function CategorySelect({
  categories,
  defaultValue,
  error,
  triggerClassName,
  onDirty,
}: CategorySelectProps) {
  // Controlled so a newly created category can be selected programmatically.
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <FieldLabel htmlFor="category" className={fieldLabelClassName}>
        Category
      </FieldLabel>
      <div className="flex items-center gap-2">
        <Select
          name="category"
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onDirty?.();
          }}
        >
          <SelectTrigger
            id="category"
            aria-invalid={Boolean(error)}
            className={`${triggerClassName ?? ""} flex-1 justify-between`}
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.length === 0 ? (
              <SelectItem value="none" disabled>
                No categories yet — use + to add one
              </SelectItem>
            ) : (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <CategoryManagerDialog
          categories={categories}
          onCategoryCreated={(category) => {
            setValue(category.id);
            onDirty?.();
          }}
          onCategoryDeleted={(id) => {
            // Never leave the form pointing at a category that no longer exists.
            setValue((current) => (current === id ? "" : current));
          }}
        />
      </div>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
