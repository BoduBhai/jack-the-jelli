import type {
  OrderStatus,
  PaymentStatus,
} from "@/features/orders/lib/order-status";
import type { DeliveryZone } from "@/features/checkout/lib/delivery";

/**
 * Serializable order shapes for client components.
 *
 * Mongoose documents don't survive the server/client boundary (§6.3) — `_id`
 * and `Date` both break — so every query maps through `toOrderDTO` in
 * features/orders/lib/orders.ts. Kept in its own file, free of any Mongoose
 * import, so a client component can pull the types without the driver
 * following them in.
 */

export interface OrderItemDTO {
  /** Provenance only. Nothing on an order screen renders from the live product. */
  productId: string;
  name: string;
  sku: string;
  slug: string;
  price: number;
  qty: number;
  lineTotal: number;
  thumbnail?: string;
}

export interface ShippingAddressDTO {
  fullName: string;
  phone: string;
  division: string;
  district: string;
  thana: string;
  street: string;
  notes?: string;
}

export interface OrderStatusEntryDTO {
  status: OrderStatus;
  /** ISO string. */
  at: string;
  note?: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  userId?: string;
  guestEmail?: string;
  shippingAddress: ShippingAddressDTO;
  deliveryZone: DeliveryZone;
  items: OrderItemDTO[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  placedAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  statusHistory: OrderStatusEntryDTO[];
  createdAt: string;
  updatedAt: string;
}

/** Everything the admin list and /my-orders row need, and nothing more. */
export interface OrderSummaryDTO {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  itemCount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}
