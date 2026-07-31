"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import type { Product } from "@/features/admin/lib/types";
import { useDirtyGuard } from "@/features/admin/hooks/useDirtyGuard";
import ProductMediaGallery from "@/features/admin/components/ProductMediaGallery";
import ProductDetailsForm from "@/features/admin/components/ProductDetailsForm";

interface ProductEditorProps {
  product: Product;
}

export default function ProductEditor({ product }: ProductEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { markDirty, clearDirty } = useDirtyGuard();

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    // TODO: implement actual save logic
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSaving(false);
    clearDirty();
  }, [clearDirty]);

  const images = [
    { src: product.thumbnail || "/image-placeholder.jpg", label: "Primary" },
    {
      src: product.thumbnail || "/image-placeholder.jpg",
      label: "Secondary",
    },
  ];

  return (
    <div className="flex h-screen min-h-0 flex-col">
      {/* Header */}
      <header className="border-border border-b px-4 py-6 md:px-12 md:py-8">
        <Link
          href="/admin/products"
          className="group text-muted-foreground hover:text-foreground flex items-center gap-2 pb-4 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span className="text-xs font-semibold tracking-widest uppercase">
            Back to Inventory
          </span>
        </Link>
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="sr-only">Product editing</h2>
            <h1 className="text-2xl font-semibold tracking-widest uppercase sm:text-3xl md:text-4xl">
              {product.name}
            </h1>
          </div>
          <div className="flex flex-col items-center gap-3 md:flex-row">
            <Button
              variant="outline"
              className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
              onClick={clearDirty}
            >
              <X className="size-4" />
              Discard
            </Button>
            <Button
              className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
              disabled={isSaving}
              onClick={handleSave}
            >
              <Save className="size-4" />
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="bg-surface flex flex-1 flex-col md:flex-row">
        <ProductMediaGallery images={images} />
        <div className="bg-muted/40 w-full md:w-3/5">
          <div className="max-w-2xl px-6 py-12 md:px-16">
            <ProductDetailsForm product={product} onDirty={markDirty} />
          </div>
        </div>
      </main>
    </div>
  );
}
