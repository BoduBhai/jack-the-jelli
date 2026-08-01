export type FulfillmentStatus =
  "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

// Represents the payment outcome for an order:
export type PaymentStatus = "pending" | "collected" | "failed";

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  material: string;
  price: number;
  qty: number;
}

export interface Order {
  orderNumber: string; // Unique order identifier (e.g. "ORD-9042")
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number; // Total order value (subtotal + delivery)
  status: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items?: OrderItem[]; // *TODO: remove optional when API is ready
  isError?: boolean; // *TODO: error state — marks rows with courier/payment issues
}

// Type-only import/re-export: erased at compile time, so client components
// importing from here never pull Mongoose into the bundle.
import type { IProductImage, ProductStatus } from "@/models/Product";

export type { IProductImage, ProductStatus };

/**
 * Serializable product for client components. Mongoose documents don't survive
 * the server/client boundary (§6.3) — `_id` and `Date` both break — so every
 * query maps through `toProductDTO` in features/admin/lib/products.ts.
 */
export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  sku: string;
  /** ObjectId string — what the category <Select> submits. */
  categoryId: string;
  /** Resolved via populate, for display. */
  categoryName: string;
  price: number;
  description?: string;
  stock: number;
  status: ProductStatus;
  thumbnail?: string;
  images: IProductImage[];
  createdAt: string;
  updatedAt: string;
}
