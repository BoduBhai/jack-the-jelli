"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDirtyGuard } from "@/features/admin/hooks/useDirtyGuard";
import ProductFormSection from "@/features/admin/components/ProductFormSection";
import ProductMediaUploader from "@/features/admin/components/ProductMediaUploader";
import {
  boxedInputClassName,
  fieldLabelClassName,
  PRODUCT_CATEGORIES,
} from "@/features/admin/lib/product-form";

export default function NewProductForm() {
  const [isCreating, setIsCreating] = useState(false);
  const [mediaKey, setMediaKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const { markDirty, clearDirty } = useDirtyGuard();

  const handleDiscard = useCallback(() => {
    formRef.current?.reset();
    // Remount the uploader to drop every staged preview.
    setMediaKey((key) => key + 1);
    clearDirty();
  }, [clearDirty]);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    // TODO: persist the product once the API/model layer exists
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsCreating(false);
    clearDirty();
  }, [clearDirty]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-16">
      {/* Header */}
      <header className="border-border border-b pb-8">
        <Link
          href="/admin/products"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span className="text-xs font-semibold tracking-widest uppercase">
            Back to Inventory
          </span>
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-heading text-3xl tracking-widest">
            Add New Product
          </h1>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
              onClick={handleDiscard}
            >
              <X className="size-4" />
              Discard
            </Button>
            <Button
              type="button"
              className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
              disabled={isCreating}
              onClick={handleCreate}
            >
              <Check className="size-4" />
              {isCreating ? "Creating…" : "Create Product"}
            </Button>
          </div>
        </div>
      </header>

      <form
        ref={formRef}
        className="flex flex-col gap-20 pb-16 md:gap-24"
        onChange={markDirty}
        onSubmit={(e) => e.preventDefault()}
      >
        <ProductFormSection
          title="Basic Information"
          description="Essential identifying details for the new addition to the curated collection."
        >
          <div className="flex flex-col gap-8">
            <Field>
              <FieldLabel
                htmlFor="product-name"
                className={fieldLabelClassName}
              >
                Product Name
              </FieldLabel>
              <Input
                id="product-name"
                name="name"
                placeholder="e.g. Hand-Burnished Leather Satchel"
                className={`${boxedInputClassName} text-lg`}
              />
            </Field>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="sku" className={fieldLabelClassName}>
                  SKU
                </FieldLabel>
                <Input
                  id="sku"
                  name="sku"
                  maxLength={16}
                  placeholder="JTJ-LHT-001"
                  className={boxedInputClassName}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category" className={fieldLabelClassName}>
                  Category
                </FieldLabel>
                <Select name="category" onValueChange={markDirty}>
                  <SelectTrigger
                    id="category"
                    className={`${boxedInputClassName} w-full justify-between`}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field className="md:w-1/2 md:pr-4">
              <FieldLabel htmlFor="price" className={fieldLabelClassName}>
                Price (BDT)
              </FieldLabel>
              <div className="relative flex items-center">
                <span className="text-muted-foreground pointer-events-none absolute left-5 text-base">
                  ৳
                </span>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  pattern="^\d+(\.\d{1,2})?$"
                  placeholder="0.00"
                  className={`${boxedInputClassName} pl-10`}
                />
              </div>
            </Field>
          </div>
        </ProductFormSection>

        <ProductFormSection
          title="Product Media"
          description="High-fidelity imagery capturing the texture and craftsmanship of the item."
        >
          <ProductMediaUploader key={mediaKey} onChange={markDirty} />
        </ProductFormSection>

        <ProductFormSection
          title="Inventory Logic"
          description="Stock management and scarcity controls for luxury distribution."
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="stock" className={fieldLabelClassName}>
                Current Stock
              </FieldLabel>
              <Input
                id="stock"
                name="stock"
                type="number"
                min={0}
                placeholder="25"
                className={boxedInputClassName}
              />
            </Field>
            <Field>
              <FieldLabel
                htmlFor="low-stock-threshold"
                className={fieldLabelClassName}
              >
                Low Stock Threshold
              </FieldLabel>
              <Input
                id="low-stock-threshold"
                name="lowStockThreshold"
                type="number"
                min={0}
                placeholder="5"
                className={boxedInputClassName}
              />
            </Field>
          </div>
        </ProductFormSection>

        <ProductFormSection
          title="Product Description"
          description="The narrative of the piece. Use this space to describe heritage, materials, and artisan details."
        >
          <Textarea
            id="description"
            name="description"
            placeholder="Begin the product narrative..."
            className="border-border bg-muted/50 focus-visible:bg-card focus-visible:border-foreground min-h-60 resize-y rounded-none border p-5 text-base leading-relaxed transition-colors"
          />
        </ProductFormSection>
      </form>
    </div>
  );
}
