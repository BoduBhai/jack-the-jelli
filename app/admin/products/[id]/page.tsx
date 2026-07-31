"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PRODUCTS } from "@/features/admin/lib/mock-products";
import ProductEditor from "@/features/admin/components/ProductEditor";

export default function EditProductPage() {
  const params = useParams();
  const product = PRODUCTS.find((p) => p.id === params.id);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-foreground text-2xl font-medium">
            Product Not Found
          </h2>
          <p className="text-muted-foreground mt-2">
            No product matches <strong>{params.id}</strong>
          </p>
          <Link href="/admin/products">
            <Button className="mt-6">Back to Inventory</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <ProductEditor product={product} />;
}
