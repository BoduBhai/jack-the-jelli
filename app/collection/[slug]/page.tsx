import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NavBar from "@/components/layout/NavBar";
import ProductDetailView from "@/features/products/components/ProductDetailView";
import RelatedProductsSection from "@/features/products/components/RelatedProductsSection";
import RelatedProductsSkeleton from "@/features/products/components/RelatedProductsSkeleton";
import { getPublicProductBySlug } from "@/features/products/lib/products";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return { title: "Piece not found | Jack The Jelli" };
  }

  return {
    title: `${product.name} | Jack The Jelli`,
    description:
      product.description ??
      `${product.name} from the ${product.category} collection.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) notFound();

  return (
    <main className="flex-1">
      <NavBar />
      <ProductDetailView product={product} />
      {/* Streams in after the piece itself — the suggestions never hold up
          first paint. */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProductsSection productId={product.id} price={product.price} />
      </Suspense>
    </main>
  );
}
