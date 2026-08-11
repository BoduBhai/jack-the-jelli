"use client";

import { ShoppingBag } from "lucide-react";
import { useCartCount, useCartStore } from "@/features/cart/lib/cartStore";

/**
 * The NavBar's cart trigger. Its own component so the badge — the one piece of
 * chrome that reads persisted state — can re-render without the rest of the
 * nav subscribing to the cart.
 */
export default function CartButton() {
  const openCart = useCartStore((state) => state.openCart);
  // 0 until the persisted cart is read back, matching the server's render.
  const count = useCartCount();

  return (
    <button
      type="button"
      onClick={openCart}
      // Negative margin holds the icon in place while the padding gives it a
      // 40px hit area; bare, it was a 20px target.
      className="text-foreground focus-visible:ring-ring/50 relative -m-2.5 p-2.5 outline-hidden transition-opacity duration-300 hover:opacity-70 focus-visible:ring-3"
      aria-label={
        count === 0 ? "Cart — empty" : `Cart — ${count} pieces. Open cart.`
      }
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="bg-foreground text-background absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center text-[10px] leading-none font-semibold tabular-nums"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
