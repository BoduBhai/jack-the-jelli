import Image from "next/image";
import { Product } from "@/features/products/lib/types";

function formatPrice(price: number) {
  return `৳ ${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <div className="group">
      <div className="bg-surface-container relative aspect-4/5 overflow-hidden">
        <Image
          src={product.thumbnail || "/image-placeholder.jpg"}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
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
