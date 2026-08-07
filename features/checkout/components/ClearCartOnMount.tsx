"use client";

import { useEffect } from "react";
import { useCartStore } from "@/features/cart/lib/cartStore";

/**
 * Empties the cart once the success page is on screen.
 *
 * It can't be done in `placeOrder` — the cart lives in localStorage and the
 * server has no reach into it — and it must not be done optimistically on
 * submit, because a rejected order (a line that sold out mid-checkout) has to
 * leave the cart intact so the customer can fix it and retry.
 */
export default function ClearCartOnMount({
  orderNumber,
}: {
  /** Re-clears if a second order lands on this page in the same session. */
  orderNumber: string;
}) {
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    clear();
  }, [clear, orderNumber]);

  return null;
}
