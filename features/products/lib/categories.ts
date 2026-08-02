import { connectDB } from "@/lib/db";
import { Category } from "@/models";

/** Addressed by slug, not `_id`: the value ends up in a shareable URL. */
export interface CategoryFilterOption {
  name: string;
  slug: string;
}

/**
 * Complete category list for the collection page's filter dropdown —
 * independent of whatever page/filter of products is currently loaded.
 */
export async function getCategoryFilterOptions(): Promise<
  CategoryFilterOption[]
> {
  await connectDB();
  const categories = await Category.find()
    .sort({ name: 1 })
    .select("name slug")
    .lean();

  return categories.map((category) => ({
    name: category.name,
    slug: category.slug,
  }));
}
