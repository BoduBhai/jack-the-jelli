import { Order } from "@/features/admin/lib/types";

// TODO: Delete this mock data once the API is ready

export const ORDERS: Order[] = [
  {
    orderNumber: "ORD-9042",
    customerName: "Eleanor Vance",
    customerEmail: "eleanor.v@example.com",
    customerPhone: "+880 17XX-XXXXXX",
    totalAmount: 3450.0,
    status: "Confirmed",
    paymentStatus: "pending",
    createdAt: "2026-07-01T10:30:00Z",
    items: [
      { id: "1", name: "Jellyfish Pendant", sku: "JEL-PND-001", material: "Resin & Gold Leaf", price: 1200, qty: 1 },
      { id: "2", name: "Ocean Glow Candle", sku: "OCN-CDL-002", material: "Soy Wax & Essential Oils", price: 850, qty: 2 },
    ],
  },
  {
    orderNumber: "ORD-9041",
    customerName: "Alistair Crane",
    customerEmail: "a.crane@holdings.com",
    customerPhone: "+880 18XX-XXXXXX",
    totalAmount: 1200.0,
    status: "Pending",
    paymentStatus: "pending",
    createdAt: "2026-07-01T09:15:00Z",
    items: [
      { id: "3", name: "Jellyfish Earring Set", sku: "JEL-ER-003", material: "Resin & Silver", price: 600, qty: 2 },
    ],
  },
  {
    orderNumber: "ORD-9038",
    customerName: "Sofia Rossi",
    customerEmail: "s.rossi@studio.it",
    customerPhone: "+880 19XX-XXXXXX",
    totalAmount: 8900.0,
    status: "Shipped",
    paymentStatus: "pending",
    createdAt: "2026-06-30T16:45:00Z",
    items: [
      { id: "4", name: "Lumina Jellyfish Lamp", sku: "LUM-LMP-004", material: "Resin & LED", price: 4500, qty: 1 },
      { id: "5", name: "Jellyfish Wall Art", sku: "JEL-WAL-005", material: "Resin & Acrylic", price: 2200, qty: 2 },
      { id: "6", name: "Aqua Glow Diffuser", sku: "AQU-DIF-006", material: "Resin & Essential Oils", price: 800, qty: 1 },
    ],
  },
  {
    orderNumber: "ORD-9035",
    customerName: "Julian Black",
    customerEmail: "j.black@example.com",
    customerPhone: "+880 16XX-XXXXXX",
    totalAmount: 450.0,
    status: "Delivered",
    paymentStatus: "failed",
    createdAt: "2026-06-29T11:00:00Z",
    items: [
      { id: "7", name: "Mini Jellyfish Keychain", sku: "JEL-KEY-007", material: "Resin & Metal", price: 450, qty: 1 },
    ],
    isError: true, // *TODO: error state row — courier failed delivery
  },
];
