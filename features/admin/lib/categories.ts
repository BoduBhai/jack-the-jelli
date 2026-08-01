import { connectDB } from "@/lib/db";
import { Category } from "@/models";
import type { CategoryOption } from "@/features/admin/lib/category-schema";

/**
 * Categories are admin-managed data, never an enum (D7) — the product forms'
 * <Select> is populated from here, server-side, and adding a category needs no
 * code change.
 *
 * Server-only: pulls in Mongoose. Mapped to plain objects because Mongoose docs
 * don't survive the server/client boundary (§6.3).
 */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  await connectDB();
  const categories = await Category.find()
    .sort({ name: 1 })
    .select("name")
    .lean();

  return categories.map((category) => ({
    id: String(category._id),
    name: category.name,
  }));
}
