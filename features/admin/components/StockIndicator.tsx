interface StockIndicatorProps {
  count: number;
}

const STOCK_CONFIG: Record<string, { color: string; label: string }> = {
  good: { color: "#8A7968", label: "" }, // Secondary (taupe)
  low: { color: "#BA1A1A", label: "" }, // Error (red)
  out: { color: "#747878", label: "" }, // Outline
};

export default function StockIndicator({ count }: StockIndicatorProps) {
  const config =
    count === 0
      ? { color: "var(--outline)", label: "Out of Stock" }
      : count <= 5
        ? { color: "var(--error)", label: `${count} Low Stock` }
        : { color: "var(--secondary)", label: `${count} In Stock` };

  return (
    <span
      className="font-label-caps text-label-caps flex items-center gap-1.5"
      style={{ color: config.color }}
    >
      <span
        className="inline-block size-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
