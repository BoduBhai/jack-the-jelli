/** Prices are stored as whole taka (BDT), never paisa — see models/Product.ts. */
export function formatPrice(price: number) {
  return `৳ ${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
