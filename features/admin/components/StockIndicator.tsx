import {
  getStockStatus,
  type StockStatus,
} from "@/features/products/lib/stock";

interface StockIndicatorProps {
  count: number;
}

// "How low is low" lives in features/products/lib/stock.ts (D3b) — never inline here.
const STOCK_STYLES: Record<StockStatus, { dot: string; text: string }> = {
  "out-of-stock": {
    dot: "bg-muted-foreground/40",
    text: "text-muted-foreground",
  },
  "low-stock": { dot: "bg-red-600", text: "text-red-600" },
  "in-stock": { dot: "bg-foreground/40", text: "text-foreground" },
};

export default function StockIndicator({ count }: StockIndicatorProps) {
  const status = getStockStatus(count);
  const style = STOCK_STYLES[status];
  const label =
    status === "out-of-stock"
      ? "OUT OF STOCK"
      : `${count} ${status === "low-stock" ? "LOW STOCK" : "IN STOCK"}`;

  return (
    <span
      className={`flex items-center gap-2 text-sm font-medium ${style.text}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}
