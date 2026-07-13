"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, X, Trash2, Upload } from "lucide-react";
import { PRODUCTS } from "@/features/admin/lib/mock-products";

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
          <Link href="/admin/inventory">
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
        <div className="flex items-center justify-between">
          <Link
            href="/admin/inventory"
            className="group text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="text-xs font-semibold tracking-widest uppercase">
              Back to Inventory
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-none px-6 text-sm tracking-widest uppercase">
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
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-12 md:px-16 md:py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Left Column: Image + Details */}
            <div className="space-y-8 lg:col-span-1">
              {/* Image Upload */}
              <div className="space-y-4">
                <FieldLabel className="text-muted-foreground text-[10px] tracking-widest uppercase">
                  Product Image
                </FieldLabel>
                <div className="relative size-full overflow-hidden rounded-none border border-border bg-accent aspect-square flex items-center justify-center">
                  <Image
                    src={product.thumbnail || "/image-placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      className="rounded-none px-4 py-2 text-xs tracking-widest uppercase"
                    >
                      <Upload className="size-3.5" />
                      Replace
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <FieldLabel className="text-muted-foreground text-[10px] tracking-widest uppercase">
                  Quick Stats
                </FieldLabel>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-border border-b py-2">
                    <span className="text-muted-foreground text-xs tracking-widest uppercase">SKU</span>
                    <span className="text-foreground font-mono text-sm">{product.sku}</span>
                  </div>
                  <div className="flex items-center justify-between border-border border-b py-2">
                    <span className="text-muted-foreground text-xs tracking-widest uppercase">Category</span>
                    <span className="text-foreground text-sm">{product.category}</span>
                  </div>
                  <div className="flex items-center justify-between border-border border-b py-2">
                    <span className="text-muted-foreground text-xs tracking-widest uppercase">Status</span>
                    <span className="text-foreground text-sm">{product.status}</span>
                  </div>
                  <div className="flex items-center justify-between border-border border-b py-2">
                    <span className="text-muted-foreground text-xs tracking-widest uppercase">Stock</span>
                    <span className="text-foreground text-sm">{product.stock} units</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Edit Form */}
            <div className="space-y-8 lg:col-span-2">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <FieldLabel className="text-muted-foreground text-xs tracking-widest uppercase">
                    Product Name
                  </FieldLabel>
                  <Input defaultValue={product.name} placeholder="Enter product name" />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel className="text-muted-foreground text-xs tracking-widest uppercase">
                      Price
                    </FieldLabel>
                    <Input
                      type="number"
                      defaultValue={product.price}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel className="text-muted-foreground text-xs tracking-widest uppercase">
                      Compare at Price
                    </FieldLabel>
                    <Input
                      type="number"
                      defaultValue={product.comparePrice ?? ""}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel className="text-muted-foreground text-xs tracking-widest uppercase">
                      Category
                    </FieldLabel>
                    <Select defaultValue={product.category.toLowerCase().replace(/ /g, "-")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="leather-goods">Leather Goods</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                          <SelectItem value="ceramics">Ceramics</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel className="text-muted-foreground text-xs tracking-widest uppercase">
                      Stock Quantity
                    </FieldLabel>
                    <Input
                      type="number"
                      defaultValue={product.stock}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel className="text-muted-foreground text-xs tracking-widest uppercase">
                    Description
                  </FieldLabel>
                  <textarea
                    className="w-full min-h-[120px] rounded-none border border-border bg-transparent p-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Describe the product..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="border-border border-t pt-6">
                <Button
                  variant="destructive"
                  className="rounded-none px-6 text-sm tracking-widest uppercase"
                >
                  <Trash2 className="size-4" />
                  Delete Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
