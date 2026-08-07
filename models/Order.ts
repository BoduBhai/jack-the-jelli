import mongoose, { Schema } from "mongoose";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from "@/features/orders/lib/order-status";
import {
  DELIVERY_ZONES,
  type DeliveryZone,
} from "@/features/checkout/lib/delivery";

/**
 * A line as it was at the moment of purchase.
 *
 * Every display field is snapshotted rather than populated from the live
 * product. Nothing on an order screen ever reads through `product` — it is
 * kept for provenance only (stock restore on cancel, "what did this customer
 * buy" reporting) — so renaming, repricing, or archiving a product can never
 * rewrite order history.
 */
export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  slug: string;
  /** Unit price in whole taka, as charged. */
  price: number;
  qty: number;
  /** price × qty, stored so a historical total never depends on re-multiplying. */
  lineTotal: number;
  thumbnail?: string;
}

export interface IShippingAddress {
  fullName: string;
  /** As typed by the customer, for the confirmation call. */
  phone: string;
  division: string;
  district: string;
  /** Upazila / thana — free text for the MVP. */
  thana: string;
  street: string;
  notes?: string;
}

export interface IOrderStatusEntry {
  status: OrderStatus;
  at: Date;
  note?: string;
}

export interface IOrder {
  orderNumber: string;
  /**
   * Minted by the client and unique — the double-submit guard. Claimed before
   * any stock is touched, so an E11000 here means "you already placed this".
   */
  idempotencyKey: string;
  /**
   * Plain ObjectId, deliberately NOT a `ref`: Better Auth owns the `user`
   * collection and there is no models/User.ts to point at, so populate() would
   * throw MissingSchemaError.
   */
  userId?: mongoose.Types.ObjectId;
  /** Lowercased. What claimGuestOrders matches a verified email against. */
  guestEmail?: string;
  /** Normalised to 01XXXXXXXXX — the /track lookup key, never displayed. */
  phoneKey: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  deliveryZone: DeliveryZone;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  /** Set when the guarded $inc decrements succeeded. */
  stockCommittedAt?: Date;
  /** Set exactly once, by whichever cancel wins the race. */
  stockRestoredAt?: Date;
  placedAt?: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  statusHistory: IOrderStatusEntry[];
  createdAt?: Date;
  updatedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    slug: { type: String, required: true },
    // BDT, whole taka — matches models/Product.ts.
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
    thumbnail: { type: String },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    division: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    thana: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false },
);

const statusEntrySchema = new Schema<IOrderStatusEntry>(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, required: true },
    note: { type: String, trim: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    idempotencyKey: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId },
    guestEmail: { type: String, lowercase: true, trim: true },
    phoneKey: { type: String, required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    deliveryZone: { type: String, enum: DELIVERY_ZONES, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Draft",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
      required: true,
    },
    stockCommittedAt: { type: Date },
    stockRestoredAt: { type: Date, default: null },
    placedAt: { type: Date },
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    statusHistory: { type: [statusEntrySchema], default: [] },
  },
  { timestamps: true },
);

// The admin list filters on status then sorts by recency; without the sort key
// in the same index Mongo sorts the whole matching set in memory.
orderSchema.index({ status: 1, createdAt: -1 });
// /my-orders.
orderSchema.index({ userId: 1, createdAt: -1 });
// Public tracking: both halves are always supplied together, and requiring the
// phone is what stops /track being an order-number oracle.
orderSchema.index({ orderNumber: 1, phoneKey: 1 });

// Hot-reload guard — without it dev throws OverwriteModelError.
// NOTE: this also means schema edits don't take effect until the dev server
// restarts, since the already-registered model is returned as-is.
const Order =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", orderSchema);

export default Order;
