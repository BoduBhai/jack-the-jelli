"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productName: string;
  /** Sold-out products render the button disabled with a "Sold out" label. */
  soldOut?: boolean;
  /** "detail" is the full-width primary CTA; "card" is the compact grid variant. */
  variant?: "card" | "detail";
  className?: string;
}

export default function AddToCartButton({
  productName,
  soldOut = false,
  variant = "card",
  className,
}: AddToCartButtonProps) {
  // Placeholder until the cart feature lands — deliberately does not claim the
  // piece was added, because nothing is stored yet.
  const handleClick = () => {
    toast("The cart is coming soon.", { description: productName });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      className={cn(
        "bg-foreground text-background hover:bg-secondary group inline-flex items-center justify-center gap-2 rounded-none text-[12px] font-semibold tracking-widest uppercase transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40",
        variant === "detail" ? "w-full py-4" : "w-full px-3 py-3",
        className,
      )}
    >
      {soldOut ? "Sold out" : "Add to cart"}
      {variant === "detail" && !soldOut && (
        <ArrowRight
          className="size-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
