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
