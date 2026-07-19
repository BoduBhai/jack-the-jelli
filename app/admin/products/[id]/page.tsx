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
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, X, Camera } from "lucide-react";
import { PRODUCTS } from "@/features/admin/lib/mock-products";
import Image from "next/image";

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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-border border-b px-4 py-6 md:px-16 md:py-8">
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
          <h1 className="text-2xl font-semibold tracking-widest uppercase sm:text-4xl">
            {product.name}
          </h1>
          <div className="flex flex-col items-center gap-3 md:flex-row">
            <Button
              variant="destructive"
              className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
            >
              <X className="size-4" />
              Discard
            </Button>
            <Button className="rounded-none px-8 py-6 text-sm tracking-widest uppercase">
              <Save className="size-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex justify-between gap-4">
        {/* Product Media */}
        <div className="border-border flex min-h-screen w-2/5 flex-col border-r">
          <div className="sticky top-45 flex flex-col gap-12 p-6">
            <div>
              <h3 className="font-heading text-foreground text-2xl font-medium">
                Product Media
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                High-fidelity imagery reflecting the quiet luxury aesthetic.
              </p>
            </div>
            <div className="grid max-w-sm grid-cols-1 gap-6">
              {/* As many images present */}
              <div className="group bg-accent relative aspect-square w-full overflow-hidden">
                <Image
                  src={product.thumbnail || "/image-placeholder.jpg"}
                  alt="Product Thumbnail"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="bg-primary/20 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="secondary" className="rounded-none p-2">
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="group bg-accent relative aspect-square w-full overflow-hidden">
                <Image
                  src={product.thumbnail || "/image-placeholder.jpg"}
                  alt="Product Thumbnail"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="bg-primary/20 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="secondary" className="rounded-none p-2">
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
              <button
                type="button"
                // onClick={() => setShowUploadModal(true)}
                className="group border-border text-muted-foreground hover:border-foreground hover:text-foreground flex aspect-square w-full flex-col items-center justify-center gap-3 border-2 border-dashed transition-colors"
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
        </div>
        {/* Product Details */}
        <div className="min-h-screen w-3/5 overflow-y-auto bg-surface">
          <div className="flex flex-col gap-32 max-w-2xl px-6 py-12 md:px-16">
            {/* Basic Information Section */}
            <section>
              <h3 className="border-border mb-8 border-b pb-4 font-heading text-foreground text-2xl font-medium">
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
                    className="border-b border-t-0 border-l-0 border-r-0 rounded-none border-b-border h-12 py-3 text-lg"
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
                      className="border-b border-t-0 border-l-0 border-r-0 rounded-none border-b-border h-12"
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
                      className="border-b border-t-0 border-l-0 border-r-0 rounded-none border-b-border h-12"
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
                      className="border-b border-t-0 border-l-0 rounded-none border-b-border h-12 justify-start rounded-r-none border-r-0"
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leather Goods">Leather Goods</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                      <SelectItem value="Limited Editions">Limited Editions</SelectItem>
                      <SelectItem value="Ceramics">Ceramics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Product Description Section */}
            <section>
              <h3 className="border-border mb-8 border-b pb-4 font-heading text-foreground text-2xl font-medium">
                Product Description
              </h3>
              <Textarea
                placeholder="Enter product description..."
                className="min-h-[200px] resize-y border-b border-t-0 border-l-0 rounded-none border-b-border text-base"
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
