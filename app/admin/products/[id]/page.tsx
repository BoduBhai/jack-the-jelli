"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, X, Camera } from "lucide-react";
import { PRODUCTS } from "@/features/admin/lib/mock-products";
import Image from "next/image";

export default function EditProductPage() {
  const params = useParams();
  const product = PRODUCTS.find((p) => p.id === params.id);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Warn on unsaved changes when navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    // TODO: implement actual save logic
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSaving(false);
    setIsDirty(false);
  }, []);

  const markDirty = useCallback(() => setIsDirty(true), []);

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
              variant="ghost"
              className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
              onClick={() => setIsDirty(false)}
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
        {/* Mobile: horizontal carousel */}
        <div className="block w-full md:hidden">
          <div className="px-4 pt-4">
            <h3 className="font-heading text-foreground text-2xl font-medium">
              Product Media
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              High-fidelity imagery reflecting the quiet luxury aesthetic.
            </p>
          </div>
          <Carousel className="relative px-4 pt-4">
            <CarouselContent>
              {/* Primary image */}
              <CarouselItem>
                <div className="group bg-accent relative aspect-square w-full overflow-hidden">
                  <Image
                    src={product.thumbnail || "/image-placeholder.jpg"}
                    alt="Product Thumbnail"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="bg-primary/20 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      className="rounded-none p-3"
                      aria-label="Remove image"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <span className="absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase">
                    Primary
                  </span>
                </div>
              </CarouselItem>
              {/* Secondary image */}
              <CarouselItem>
                <div className="group bg-accent relative aspect-square w-full overflow-hidden">
                  <Image
                    src={product.thumbnail || "/image-placeholder.jpg"}
                    alt="Product Thumbnail"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="bg-primary/20 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      className="rounded-none p-3"
                      aria-label="Remove image"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <span className="absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase">
                    Secondary
                  </span>
                </div>
              </CarouselItem>
              {/* Upload new */}
              <CarouselItem>
                <button
                  type="button"
                  className="group border-border text-muted-foreground hover:border-foreground hover:text-foreground flex aspect-square w-full flex-col items-center justify-center gap-3 border-2 border-dashed transition-colors"
                  aria-label="Upload new image"
                >
                  <div className="relative">
                    <Camera className="size-8" />
                    <span className="bg-foreground text-background absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[8px]">
                      +
                    </span>
                  </div>
                  <span className="text-xs tracking-widest uppercase">
                    Upload New
                  </span>
                </button>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="left-1" />
            <CarouselNext className="right-1" />
          </Carousel>
        </div>

        {/* Desktop: simple grid */}
        <div className="hidden w-2/5 flex-col px-6 py-12 md:block md:px-16">
          <div className="mb-8">
            <h3 className="font-heading text-foreground text-2xl font-medium">
              Product Media
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              High-fidelity imagery reflecting the quiet luxury aesthetic.
            </p>
          </div>
          <div className="grid max-w-sm grid-cols-1 gap-6">
            {/* Primary image */}
            <div className="group bg-accent relative aspect-square w-full overflow-hidden">
              <Image
                src={product.thumbnail || "/image-placeholder.jpg"}
                alt="Product Thumbnail"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="bg-primary/20 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="secondary"
                  className="rounded-none p-2"
                  aria-label="Remove image"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <span className="absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase">
                Primary
              </span>
            </div>
            {/* Secondary image */}
            <div className="group bg-accent relative aspect-square w-full overflow-hidden">
              <Image
                src={product.thumbnail || "/image-placeholder.jpg"}
                alt="Product Thumbnail"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="bg-primary/20 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="secondary"
                  className="rounded-none p-2"
                  aria-label="Remove image"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <span className="absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase">
                Secondary
              </span>
            </div>
            {/* Upload new */}
            <button
              type="button"
              className="group border-border text-muted-foreground hover:border-foreground hover:text-foreground flex aspect-square w-full flex-col items-center justify-center gap-3 border-2 border-dashed transition-colors"
              aria-label="Upload new image"
            >
              <div className="relative">
                <Camera className="size-8" />
                <span className="bg-foreground text-background absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[8px]">
                  +
                </span>
              </div>
              <span className="text-xs tracking-widest uppercase">
                Upload New
              </span>
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-3/5">
          <div className="max-w-2xl px-6 py-12 md:px-16">
            <div className="flex flex-col gap-12 sm:gap-20 md:gap-32">
              {/* Basic Information */}
              <section>
                <h3 className="border-border font-heading text-foreground mb-8 border-b pb-4 text-2xl font-medium">
                  Basic Information
                </h3>
                <div className="flex flex-col gap-12">
                  {/* Product Name */}
                  <div>
                    <Label
                      htmlFor="product-name"
                      className="text-muted-foreground mb-2 block text-xs font-semibold tracking-widest uppercase"
                    >
                      Product Name
                    </Label>
                    <Input
                      id="product-name"
                      defaultValue={product.name}
                      className="border-b-border h-12 rounded-none border-t-0 border-r-0 border-b border-l-0 py-3 text-lg"
                      onChange={markDirty}
                    />
                  </div>

                  {/* SKU + Price */}
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="sku"
                        className="text-muted-foreground mb-2 block text-xs font-semibold tracking-widest uppercase"
                      >
                        SKU
                      </Label>
                      <Input
                        id="sku"
                        defaultValue={product.sku}
                        className="border-b-border h-12 rounded-none border-t-0 border-r-0 border-b border-l-0"
                        maxLength={16}
                        placeholder="e.g. JTG-LEA-001"
                        onChange={markDirty}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="price"
                        className="text-muted-foreground mb-2 block text-xs font-semibold tracking-widest uppercase"
                      >
                        Price (USD)
                      </Label>
                      <Input
                        id="price"
                        type="text"
                        defaultValue={product.price.toFixed(2)}
                        className="border-b-border h-12 rounded-none border-t-0 border-r-0 border-b border-l-0"
                        pattern="^\$?\d+(\.\d{1,2})?$"
                        placeholder="0.00"
                        onChange={markDirty}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <Label
                      htmlFor="category"
                      className="text-muted-foreground mb-2 block text-xs font-semibold tracking-widest uppercase"
                    >
                      Category
                    </Label>
                    <Select defaultValue={product.category}>
                      <SelectTrigger
                        id="category"
                        className="border-b-border h-12 justify-start rounded-none rounded-r-none border-t-0 border-r-0 border-b border-l-0"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Leather Goods">
                          Leather Goods
                        </SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Limited Editions">
                          Limited Editions
                        </SelectItem>
                        <SelectItem value="Ceramics">Ceramics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Product Description */}
              <section>
                <h3 className="border-border font-heading text-foreground mb-8 border-b pb-4 text-2xl font-medium">
                  Product Description
                </h3>
                <Textarea
                  placeholder="Describe the product story, materials, care instructions..."
                  className="border-b-border min-h-[200px] resize-y rounded-none border-t-0 border-b border-l-0 text-base"
                  onChange={markDirty}
                />
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
