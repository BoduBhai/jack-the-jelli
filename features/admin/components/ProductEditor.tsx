"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useActionState, useRef } from "react";
import { ArrowLeft, Check, FileText } from "lucide-react";
import type { CategoryOption } from "@/features/admin/lib/category-schema";
import type { ProductDTO } from "@/features/admin/lib/types";
import { useDirtyGuard } from "@/features/admin/hooks/useDirtyGuard";
import { useProductSubmit } from "@/features/admin/hooks/useProductSubmit";
import ProductDetailsForm from "@/features/admin/components/ProductDetailsForm";
import ProductMediaUploader, {
  type ProductMediaUploaderHandle,
} from "@/features/admin/components/ProductMediaUploader";
import { emptyFormState } from "@/features/admin/lib/form-state";
import { updateProduct } from "@/features/admin/lib/product-actions";
import { updateProductSchema } from "@/features/admin/lib/product-schema";

interface ProductEditorProps {
  product: ProductDTO;
  categories: CategoryOption[];
}

export default function ProductEditor({
  product,
  categories,
}: ProductEditorProps) {
  const [state, formAction, isPending] = useActionState(
    updateProduct,
    emptyFormState,
  );
  const uploaderRef = useRef<ProductMediaUploaderHandle>(null);
  const { markDirty, clearDirty } = useDirtyGuard();

  // A successful save redirects server-side, so the guard stands down as the
  // submit starts; any later edit re-marks it via onChange.
  const { handleSubmit, isUploading, errors } = useProductSubmit({
    uploaderRef,
    formAction,
    state,
    schema: updateProductSchema,
    onBeforeDispatch: clearDirty,
  });

  const isSubmitBlocked = isPending || isUploading;

  return (
    <form
      action={formAction}
      onChange={markDirty}
      onSubmit={handleSubmit}
      className="flex min-h-screen flex-col"
    >
      <input type="hidden" name="id" value={product.id} />

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
            <p className="text-muted-foreground mt-2 text-xs font-semibold tracking-widest uppercase">
              Currently {product.status}
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 md:flex-row">
            <Button
              asChild
              variant="ghost"
              className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
            >
              <Link href="/admin/products">Cancel</Link>
            </Button>
            {/* Same intent switch as the create form (D4) — this is how a
                draft gets published, and how a live product gets pulled. */}
            <Button
              type="submit"
              name="intent"
              value="draft"
              variant="outline"
              className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
              disabled={isSubmitBlocked}
            >
              <FileText className="size-4" />
              {product.status === "Published" ? "Unpublish" : "Save as Draft"}
            </Button>
            <Button
              type="submit"
              name="intent"
              value="publish"
              className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
              disabled={isSubmitBlocked}
            >
              <Check className="size-4" />
              {isSubmitBlocked ? "Saving…" : "Publish"}
            </Button>
          </div>
        </div>

        {state.message && (
          <p role="alert" className="text-destructive mt-4 text-sm">
            {state.message}
          </p>
        )}
      </header>

      {/* Content */}
      <main className="bg-surface flex flex-1 flex-col md:flex-row">
        <div className="w-full px-4 py-8 md:w-2/5 md:px-16 md:py-12">
          <div className="mb-8">
            <h3 className="font-heading text-foreground text-2xl font-medium">
              Product Media
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              High-fidelity imagery reflecting the quiet luxury aesthetic.
            </p>
          </div>
          {/* Seeded with the saved images so a save never wipes the gallery. */}
          <ProductMediaUploader
            ref={uploaderRef}
            initialImages={product.images}
            onChange={markDirty}
          />
        </div>

        <div className="bg-muted/40 w-full md:w-3/5">
          <div className="max-w-2xl px-6 py-12 md:px-16">
            <ProductDetailsForm
              product={product}
              categories={categories}
              errors={errors}
              values={state.values}
              onDirty={markDirty}
            />
          </div>
        </div>
      </main>
    </form>
  );
}
