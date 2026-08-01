import NewProductForm from "@/features/admin/components/NewProductForm";
import { getCategoryOptions } from "@/features/admin/lib/categories";

export const metadata = {
  title: "Add New Product",
};

// The category list is admin-managed data (D7) — never bake it into a build.
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  // Zero categories is a normal state: the form's category field manages them
  // inline, so there's no dead end to route around.
  const categories = await getCategoryOptions();

  return <NewProductForm categories={categories} />;
}
