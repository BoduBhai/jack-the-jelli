import RelatedProducts from "@/features/products/components/RelatedProducts";
import { getRelatedProducts } from "@/features/products/lib/products";

/**
 * Keeps the Mongoose-importing query out of the client carousel, and lets the
 * detail page stream before this resolves.
 */
export default async function RelatedProductsSection({
  productId,
  price,
}: {
  productId: string;
  price: number;
}) {
  const products = await getRelatedProducts({ productId, price });

  // Nothing to suggest — render no section rather than a lone hairline.
  if (products.length === 0) return null;

  return <RelatedProducts products={products} />;
}
