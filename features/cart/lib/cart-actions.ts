"use server";

import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { MAX_CART_LINES } from "@/features/cart/lib/limits";
import type { CartSnapshot } from "@/features/cart/lib/types";

/**
 * Current price, stock and published state for the ids a browser is holding.
 *
 * Called when the cart sheet opens and again on entering /checkout, so a cart
 * that has been sitting in localStorage for a week doesn't quote last month's
 * price or offer a piece that has since sold out. Purely advisory — it changes
 * what the customer sees, never what they're charged. `placeOrder` re-reads
 * all of this itself and is the only authority on either.
 *
 * No auth guard: it exposes nothing a visitor can't already read off the
 * public product page.
 */
export async function revalidateCart(
  productIds: string[],
): Promise<CartSnapshot[]> {
  const ids = Array.from(new Set(productIds))
    .filter((id) => Types.ObjectId.isValid(id))
    .slice(0, MAX_CART_LINES)
    .map((id) => new Types.ObjectId(id));

  if (ids.length === 0) return [];

  await connectDB();

  const products = await Product.find({ _id: { $in: ids } })
    .select("name slug price thumbnail stock status")
    .lean();

  return products.map((product) => ({
    productId: String(product._id),
    name: product.name,
    slug: product.slug,
    price: product.price,
    thumbnail: product.thumbnail,
    stock: product.stock,
    // Draft and Archived pieces are not buyable, whatever the cart remembers.
    available: product.status === "Published",
  }));
}
