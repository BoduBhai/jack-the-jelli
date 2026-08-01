"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { connectDB } from "@/lib/db";
import { getDuplicateKeyFields } from "@/lib/mongo-errors";
import { Category, Product } from "@/models";
import { collectValues, toFieldErrors } from "@/features/admin/lib/form-state";
import {
  CATEGORY_VALUE_FIELDS,
  type CategoryActionState,
  createCategorySchema,
  deleteCategorySchema,
  readCategoryFormData,
  updateCategorySchema,
} from "@/features/admin/lib/category-schema";

// A category change alters the <Select> options rendered by both product forms,
// so every route showing them gets revalidated on each mutation. The edit route
// is dynamic, hence the explicit "page" type.
function revalidateCategoryConsumers() {
  revalidatePath("/admin/products/new");
  revalidatePath("/admin/products/[id]", "page");
  revalidatePath("/admin/products");
}

/**
 * Category slugs are NOT de-duplicated (see models/Category.ts) — a second
 * "Bifold Wallet" is a mistake, not a new category, so the unique index rejects
 * it and we translate that into a field message.
 */
function duplicateCategoryErrors(error: unknown): Record<string, string> | null {
  const fields = getDuplicateKeyFields(error);
  if (fields.length === 0) return null;
  return { name: "A category with this name already exists" };
}

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const values = collectValues(formData, CATEGORY_VALUE_FIELDS);
  const parsed = createCategorySchema.safeParse(readCategoryFormData(formData));

  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values };
  }

  let created;
  try {
    await connectDB();
    // The slug is derived by the model's pre("validate") hook.
    created = await Category.create(parsed.data);
  } catch (error) {
    const duplicates = duplicateCategoryErrors(error);
    if (duplicates) return { ok: false, errors: duplicates, values };

    console.error("createCategory failed", error);
    return {
      ok: false,
      values,
      message: "Something went wrong while saving this category.",
    };
  }

  revalidateCategoryConsumers();
  return {
    ok: true,
    message: `Added “${created.name}”.`,
    category: { id: String(created._id), name: created.name },
  };
}

export async function updateCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const values = collectValues(formData, CATEGORY_VALUE_FIELDS);
  const parsed = updateCategorySchema.safeParse(readCategoryFormData(formData));

  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error), values };
  }

  const { id, name, description } = parsed.data;

  try {
    await connectDB();
    const category = await Category.findById(id);
    if (!category) {
      return { ok: false, values, message: "That category no longer exists." };
    }

    category.name = name;
    category.description = description;
    // save() (not findByIdAndUpdate) so the slug hook runs.
    await category.save();
  } catch (error) {
    const duplicates = duplicateCategoryErrors(error);
    if (duplicates) return { ok: false, errors: duplicates, values };

    console.error("updateCategory failed", error);
    return {
      ok: false,
      values,
      message: "Something went wrong while renaming this category.",
    };
  }

  revalidateCategoryConsumers();
  return {
    ok: true,
    message: `Renamed to “${name}”.`,
    category: { id, name },
  };
}

export async function deleteCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsed = deleteCategorySchema.safeParse(readCategoryFormData(formData));
  if (!parsed.success) {
    return { ok: false, message: "That category no longer exists." };
  }

  try {
    await connectDB();

    // Refuse rather than orphaning products onto a missing category ref.
    const inUse = await Product.countDocuments({ category: parsed.data.id });
    if (inUse > 0) {
      return {
        ok: false,
        message: `This category still has ${inUse} product${inUse === 1 ? "" : "s"}. Move them before deleting it.`,
      };
    }

    const deleted = await Category.findByIdAndDelete(parsed.data.id);
    if (!deleted) {
      return { ok: false, message: "That category no longer exists." };
    }
  } catch (error) {
    console.error("deleteCategory failed", error);
    return {
      ok: false,
      message: "Something went wrong while deleting this category.",
    };
  }

  revalidateCategoryConsumers();
  return { ok: true, message: "Category deleted." };
}
