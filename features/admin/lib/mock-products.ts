import { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "PRD-001",
    name: "The Heritage Tote",
    sku: "LTH-001",
    category: "Leather Goods",
    price: 850.0,
    stock: 24,
    status: "Published",
  },
  {
    id: "PRD-002",
    name: "Classic Cardholder",
    sku: "LTH-042",
    category: "Leather Goods",
    price: 185.0,
    stock: 3,
    status: "Published",
  },
  {
    id: "PRD-003",
    name: "Brass Buckle Belt",
    sku: "ACC-119",
    category: "Accessories",
    price: 210.0,
    stock: 0,
    status: "Published",
  },
  {
    id: "PRD-004",
    name: "Asymmetric Vessel",
    sku: "CER-088",
    category: "Ceramics",
    price: 420.0,
    stock: 12,
    status: "Published",
  },
];
