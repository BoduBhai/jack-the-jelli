import { connectDB } from "@/lib/db";
import { Category } from "@/models";

export interface CategoryFilterOption {
  id: string;
  name: string;
}

/**
 * Complete category list for the collection page's filter dropdown —
 * independent of whatever page/filter of products is currently loaded.
 */
export async function getCategoryFilterOptions(): Promise<
  CategoryFilterOption[]
> {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).select("name").lean();

  return categories.map((category) => ({
    id: String(category._id),
    name: category.name,
  }));
}
