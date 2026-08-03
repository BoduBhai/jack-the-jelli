// Single source of truth for "what counts as low stock" (D3b). No product field,
// no inline `<= 5` in JSX — when this becomes a store-wide admin setting, only
// this module changes.

export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "out-of-stock" | "low-stock" | "in-stock";

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}
