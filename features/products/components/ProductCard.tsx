import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/features/products/components/AddToCartButton";
import { formatPrice } from "@/features/products/lib/format";
import { Product } from "@/features/products/lib/types";

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const href = `/collection/${product.slug}`;

  return (
    <div className="group">
      <Link href={href} tabIndex={-1} aria-hidden="true">
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
      </Link>

      <div className="mt-4 text-center">
        <h3 className="text-foreground font-serif text-[18px] leading-[1.6]">
          {product.name}
        </h3>
        <p className="text-on-surface-variant mt-1 text-[16px] leading-[1.6]">
          {formatPrice(product.price)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <AddToCartButton productName={product.name} />
        <Link
          href={href}
          className="border-secondary text-foreground hover:bg-secondary hover:text-background inline-flex items-center justify-center rounded-none border bg-transparent px-3 py-3 text-[12px] font-semibold tracking-widest uppercase transition-colors duration-300"
        >
          View details
        </Link>
      </div>
    </div>
  );
}
