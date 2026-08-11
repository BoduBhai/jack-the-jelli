import { notFound } from "next/navigation";
import ProductEditor from "@/features/admin/components/ProductEditor";
import { getCategoryOptions } from "@/features/admin/lib/categories";
import { getProductById } from "@/features/admin/lib/products";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategoryOptions(),
  ]);

  if (!product) notFound();

  return <ProductEditor product={product} categories={categories} />;
}
