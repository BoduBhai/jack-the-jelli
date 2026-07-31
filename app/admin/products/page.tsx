"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "@/features/admin/lib/mock-products";
import { Plus, Search, Pencil } from "lucide-react";

import { useMemo, useState } from "react";

export default function AdminInventory() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // *TODO: server-side filter when API is ready — currently client-side
  const filteredProducts = useMemo(
    () =>
      PRODUCTS.filter(
        (o) =>
          o.name.toLowerCase().includes(search.toLowerCase()) ||
          o.sku.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  // *TODO: pagination — slice data based on current page
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl tracking-widest">
            Inventory Catalog
          </h1>
        </div>
        <Button
          asChild
          variant="default"
          className="rounded-none px-8 py-6 text-sm tracking-widest uppercase"
        >
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            Add Item
          </Link>
        </Button>
      </header>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Field
          className="border-primary flex-1 border-b p-2"
          orientation="horizontal"
        >
          <Input
            className="focus-visible:border-input focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={search}
            placeholder="Search by name, SKU..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search />
        </Field>

        <Field className="border-primary w-48 border-b p-2">
          <Select defaultValue="all">
            <SelectTrigger className="">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="border-border bg-card flex-1 overflow-hidden border transition-shadow duration-500 hover:shadow-[0px_12px_32px_rgba(26,26,26,0.04)]">
        <Table className="min-w-200">
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-base">
            {paginatedProducts.map((product) => {
              const isError = product.isError;
              return (
                <TableRow
                  key={product.id}
                  className={
                    isError
                      ? "bg-destructive/10 hover:bg-destructive/20"
                      : "hover:bg-muted"
                  }
                >
                  <TableCell className="py-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-accent relative size-16 shrink-0 overflow-hidden rounded-none">
                        <Image
                          src={product.thumbnail || "/image-placeholder.jpg"}
                          alt={product.name}
                          fill
                          sizes="4rem"
                          className="object-cover"
                        />
                      </div>
                      <span className="font-heading text-foreground text-base">
                        {product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-8">
                    <span className="text-foreground font-mono text-sm tracking-wide">
                      {product.sku}
                    </span>
                  </TableCell>
                  <TableCell className="py-8">
                    <span className="text-foreground text-sm">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="py-8">
                    <span className="text-foreground text-sm">
                      ৳{" "}
                      {product.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="py-8">
                    {product.stock > 0 ? (
                      product.stock <= 5 ? (
                        <span className="flex items-center gap-2 text-sm font-medium text-red-600">
                          <span className="size-1.5 rounded-full bg-red-600" />
                          {product.stock} LOW STOCK
                        </span>
                      ) : (
                        <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                          <span className="bg-foreground/40 size-1.5 rounded-full" />
                          {product.stock} IN STOCK
                        </span>
                      )
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                        <span className="bg-muted-foreground/40 size-1.5 rounded-full" />
                        OUT OF STOCK
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-8 text-right">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground rounded-none p-2"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
