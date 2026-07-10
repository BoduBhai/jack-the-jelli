"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Package,
  Phone,
  Mail,
  Pencil,
  Check,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ORDERS } from "@/features/admin/lib/mock-data";
import Link from "next/link";
import { useState } from "react";

// *TODO: fetch order data from API when ready — currently using mock data
const FULFILLMENT_OPTIONS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;
type FulfillmentStatus = (typeof FULFILLMENT_OPTIONS)[number];

const PAYMENT_OPTIONS = ["pending", "collected", "failed"] as const;
type PaymentStatus = (typeof PAYMENT_OPTIONS)[number];

export default function OrderDetailsPage() {
  const params = useParams();
  // *TODO: replace with API fetch using params.id
  const found = ORDERS.find((o) => o.orderNumber === params.id);

  // *TODO: normalize ORDERS format (flat fields) to page format (nested client)
  const order = found
    ? {
        id: found.orderNumber,
        client: {
          name: found.customerName,
          email: found.customerEmail,
          phone: found.customerPhone,
          address: "Address not available",
        },
        codStatus: found.status as FulfillmentStatus,
        paymentStatus: found.paymentStatus as PaymentStatus,
        items: found.items ?? [],
        subtotal: found.totalAmount,
        shipping: 0,
        total: found.totalAmount,
      }
    : null;

  type EditField = "fulfillment" | "payment" | null;

  const [editField, setEditField] = useState<EditField>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const openDialog = (field: EditField) => {
    setEditField(field);
    setEditValue("");
    setSaveSuccess(false);
  };

  const handleClose = () => {
    setEditValue("");
    setSaveSuccess(false);
    setEditField(null);
  };

  // *TODO: save handler — wire to API on submit
  const handleSave = async () => {
    if (!editValue || !editField) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // *TODO: API call here to update the order status
      console.log(`Saving ${editField} status to: ${editValue}`);
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));
      setSaveSuccess(true);
      setTimeout(() => handleClose(), 600);
    } catch {
      // *TODO: show error toast — "Failed to update status. Please try again."
      console.error("Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  // *TODO: show empty state when order not found
  if (!order) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-foreground text-2xl font-medium">
            Order Not Found
          </h2>
          <p className="text-muted-foreground mt-2">
            No order matches <strong>#{params.id}</strong>
          </p>
          <Link href="/admin">
            <Button className="mt-6">Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Main Content */}
      <main className="flex-1">
        {/* Header Section */}
        <header className="border-b px-4 py-6 md:px-16 md:py-12 lg:flex lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/admin"
              className="group text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span className="text-xs font-semibold tracking-widest uppercase">
                Back to Orders
              </span>
            </Link>
            <h2 className="font-heading text-foreground text-2xl font-medium">
              Order Details: #{order.id}
            </h2>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="mx-auto px-4 py-12 md:px-16 lg:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Information Groups */}
            <div className="space-y-8 lg:col-span-4">
              {/* Client & Shipping Section */}
              <section className="border-border space-y-6 rounded-none border p-6">
                {/* Section Header */}
                <div>
                  <h3 className="text-foreground text-sm font-semibold tracking-widest uppercase">
                    Client &amp; Shipping
                  </h3>
                  <div className="bg-border mt-2 h-px w-16" />
                </div>

                {/* Recipient */}
                <div className="space-y-3">
                  <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
                    Recipient
                  </p>
                  <p className="font-heading text-foreground text-xl font-medium">
                    {order.client.name}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
                    Contact Information
                  </p>
                  <div className="space-y-2">
                    <div className="text-foreground flex items-center gap-2.5">
                      <Mail className="text-muted-foreground/60 size-4 shrink-0" />
                      <span className="text-sm">{order.client.email}</span>
                    </div>
                    <div className="text-foreground flex items-center gap-2.5">
                      <Phone className="text-muted-foreground/60 size-4 shrink-0" />
                      <span className="text-sm">{order.client.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-3">
                  <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
                    Shipping Address
                  </p>
                  {order.client.address === "Address not available" ? (
                    <div className="border-border flex items-center gap-2 rounded-none border border-dashed px-3 py-2.5">
                      <Package className="text-muted-foreground/40 size-3.5" />
                      <span className="text-muted-foreground/60 text-sm italic">
                        No shipping address provided
                      </span>
                    </div>
                  ) : (
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                      {order.client.address}
                    </p>
                  )}
                </div>
              </section>

              {/* Financial & Status Section */}
              <section className="border-border space-y-6 rounded-none border p-6">
                {/* Section Header */}
                <div>
                  <h3 className="text-foreground text-sm font-semibold tracking-widest uppercase">
                    Financial &amp; Status
                  </h3>
                  <div className="bg-border mt-2 h-px w-16" />
                </div>

                <div className="space-y-4">
                  {/* Fulfillment Status */}
                  <div className="border-border flex items-center justify-between rounded-none border p-4">
                    <span className="text-sm font-medium">
                      {order.codStatus}
                    </span>

                    <Dialog onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-secondary" onClick={() => openDialog("fulfillment")}>
                          <Pencil className="size-3.5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Fulfillment Status</DialogTitle>
                          <DialogDescription>
                            Update the fulfillment stage for this order. This
                            controls the shipping workflow.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-widest uppercase">
                            Fulfillment Status
                          </Label>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            {FULFILLMENT_OPTIONS.map((option) => {
                              const isActive = editField === "fulfillment" && editValue === option;
                              const isCancelled = option === "Cancelled";
                              return (
                                <Button
                                  key={option}
                                  size="sm"
                                  variant={
                                    isCancelled
                                      ? "destructive"
                                      : isActive
                                        ? "secondary"
                                        : "default"
                                  }
                                  className="rounded-none"
                                  onClick={() => setEditValue(option)}
                                >
                                  {option}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                        {saveSuccess && (
                          <div className="mb-2 flex items-center gap-2 text-sm text-green-600">
                            <Check className="size-4" />
                            <span>Status updated successfully</span>
                          </div>
                        )}
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" size="sm" onClick={handleClose}>
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || !editValue}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Saving…
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Payment Status */}
                  <div className="border-border flex items-center justify-between rounded-none border p-4">
                    <span className="text-sm font-medium">
                      {order.paymentStatus}
                    </span>

                    <Dialog onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-secondary" onClick={() => openDialog("payment")}>
                          <Pencil className="size-3.5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Payment Status</DialogTitle>
                          <DialogDescription>
                            Update the payment collection status for this order.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-widest uppercase">
                            Payment Status
                          </Label>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            {PAYMENT_OPTIONS.map((option) => {
                              const isActive = editField === "payment" && editValue === option;
                              const isFailed = option === "failed";
                              return (
                                <Button
                                  key={option}
                                  size="sm"
                                  variant={
                                    isFailed
                                      ? "destructive"
                                      : isActive
                                        ? "secondary"
                                        : "default"
                                  }
                                  className="rounded-none"
                                  onClick={() => setEditValue(option)}
                                >
                                  {option}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                        {saveSuccess && (
                          <div className="mb-2 flex items-center gap-2 text-sm text-green-600">
                            <Check className="size-4" />
                            <span>Status updated successfully</span>
                          </div>
                        )}
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" size="sm" onClick={handleClose}>
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || !editValue}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Saving…
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Order Items */}
            <div className="lg:col-span-8">
              <section className="border-border space-y-6 rounded-none border p-6">
                {/* Section Header */}
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="font-heading text-foreground text-lg font-medium">
                      Order Items
                    </h3>
                    <div className="bg-border mt-2 h-px w-16" />
                  </div>
                  {/* *TODO: unit count — uses text-muted-foreground at 80% + text-xs (12px) */}
                  <p className="text-muted-foreground/80 text-xs font-semibold tracking-widest uppercase">
                    {order.items.reduce((sum, item) => sum + item.qty, 0)} Units
                    Total
                  </p>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="group border-border hover:bg-accent/20 flex items-center gap-6 rounded-none border px-5 py-5 transition-colors duration-300"
                    >
                      {/* *TODO: item image — uses bg-card (#f9f8f6) mapped in @theme */}
                      <div className="bg-card relative size-20 shrink-0 overflow-hidden">
                        <Image
                          src="/image-placeholder.jpg"
                          alt={item.name}
                          width={80}
                          height={80}
                          className="size-full object-cover"
                          onError={(e) => {
                            // Image failed to load — hide it
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                        <div className="text-muted-foreground/30 absolute inset-0 flex size-full items-center justify-center">
                          <Package className="size-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground/40 mb-1 text-[10px] font-semibold tracking-widest uppercase">
                          SKU: {item.sku}
                        </p>
                        <h4 className="font-heading text-foreground text-base font-medium">
                          {item.name}
                        </h4>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                          {item.material}
                        </p>
                      </div>
                      <div className="text-right">
                        {/* *TODO: item price — uses text-foreground mapped in @theme */}
                        <p className="text-foreground text-sm font-semibold">
                          ৳
                          {item.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-muted-foreground/40 mt-1 text-[10px] font-semibold tracking-widest uppercase">
                          Qty: {item.qty}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-border border-t pt-6">
                  <div className="flex flex-col items-end space-y-4">
                    <div className="flex w-full justify-end md:w-72">
                      <div className="w-full space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Subtotal
                          </span>
                          <span className="text-foreground font-medium">
                            ৳
                            {order.subtotal.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Shipping
                          </span>
                          <span className="text-foreground font-medium">
                            ৳
                            {order.shipping.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-border h-px w-full md:w-72" />
                    <div className="flex w-full items-center justify-end md:w-72">
                      <span className="text-foreground text-xs font-semibold tracking-widest uppercase">
                        Total Amount
                      </span>
                      <span className="font-heading text-foreground ml-6 text-3xl font-medium">
                        ৳
                        {order.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
