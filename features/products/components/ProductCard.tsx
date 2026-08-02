import { Product } from "@/features/products/lib/types";

function formatPrice(price: number) {
  return `৳ ${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group">
      <div className="relative aspect-4/5 overflow-hidden bg-(--surface-container)">
        <div className="absolute inset-0 flex items-center justify-center text-sm text-(--on-surface-variant) transition-transform duration-700 group-hover:scale-105">
          Image placeholder
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-foreground font-serif text-[18px] leading-[1.6]">
          {product.name}
        </h3>
        <p className="text-on-surface-variant mt-1 text-[16px] leading-[1.6]">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}
