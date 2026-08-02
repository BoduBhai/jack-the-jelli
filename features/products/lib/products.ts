import { Types, type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import { escapeRegex } from "@/lib/slug";
import { Category, Product, type IProduct } from "@/models";
import type {
  Product as PublicProduct,
  ProductDetail,
} from "@/features/products/lib/types";

// Server-only: pulls in Mongoose. Returns plain, serializable objects since
// Mongoose docs don't cross the server/client boundary (§6.3).

export const PRODUCTS_PER_PAGE = 9;

export type SortOption = "newest" | "price-asc" | "price-desc";

const SORT_MAP: Record<SortOption, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
};

/** A lean product with its category ref resolved by populate. */
type LeanProduct = Omit<IProduct, "category"> & {
  _id: Types.ObjectId;
  category: { _id: Types.ObjectId; name: string } | null;
};

function toPublicProduct(product: LeanProduct): PublicProduct {
  return {
    id: String(product._id),
    slug: product.slug,
    name: product.name,
    price: product.price,
    thumbnail: product.thumbnail,
    // A category deleted out from under a product shouldn't crash the grid.
    category: product.category?.name ?? "Uncategorised",
    createdAt: product.createdAt?.toISOString() ?? "",
  };
}

function toProductDetail(product: LeanProduct): ProductDetail {
  return {
    id: String(product._id),
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    // A category deleted out from under a product shouldn't crash the page.
    category: product.category?.name ?? "Uncategorised",
    price: product.price,
    description: product.description,
    stock: product.stock,
    thumbnail: product.thumbnail,
    images: (product.images ?? []).map((image) => ({
      url: image.url,
      publicId: image.publicId,
    })),
  };
}

export interface PublicProductQuery {
  q?: string;
  categoryId?: string;
  sort?: SortOption;
  page?: number;
}

export interface PublicProductListResult {
  products: PublicProduct[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getPublicProducts({
  q,
  categoryId,
  sort = "newest",
  page = 1,
}: PublicProductQuery): Promise<PublicProductListResult> {
  await connectDB();
  // Referenced so the "Category" model is registered before populate runs.
  void Category;

  const filter: QueryFilter<IProduct> = { status: "Published" };

  const search = q?.trim();
  if (search) {
    // Escaped so a stray "(" in the search box can't throw a regex error.
    filter.name = new RegExp(escapeRegex(search), "i");
  }
  if (categoryId && Types.ObjectId.isValid(categoryId)) {
    filter.category = new Types.ObjectId(categoryId);
  }

  const total = await Product.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const products = await Product.find(filter)
    .sort(SORT_MAP[sort])
    .skip((currentPage - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE)
    .populate<{ category: { _id: Types.ObjectId; name: string } | null }>(
      "category",
      "name",
    )
    .lean<LeanProduct[]>();

  return {
    products: products.map(toPublicProduct),
    total,
    page: currentPage,
    totalPages,
  };
}

export interface RelatedProductQuery {
  /** The product being viewed — excluded from its own suggestions. */
  productId: string;
  price: number;
  limit?: number;
}

/**
 * Pieces nearest in price to the one being viewed, regardless of category.
 * Two bounded queries (one on each side of the price) beat scanning the whole
 * catalogue and sorting the distance in memory.
 */
export async function getRelatedProducts({
  productId,
  price,
  limit = 8,
}: RelatedProductQuery): Promise<PublicProduct[]> {
  if (!Types.ObjectId.isValid(productId)) return [];

  await connectDB();
  // Referenced so the "Category" model is registered before populate runs.
  void Category;

  const base: QueryFilter<IProduct> = {
    status: "Published",
    _id: { $ne: new Types.ObjectId(productId) },
  };

  const [atOrAbove, below] = await Promise.all([
    Product.find({ ...base, price: { $gte: price } })
      .sort({ price: 1, createdAt: -1 })
      .limit(limit)
      .populate<{ category: { _id: Types.ObjectId; name: string } | null }>(
        "category",
        "name",
      )
      .lean<LeanProduct[]>(),
    Product.find({ ...base, price: { $lt: price } })
      .sort({ price: -1, createdAt: -1 })
      .limit(limit)
      .populate<{ category: { _id: Types.ObjectId; name: string } | null }>(
        "category",
        "name",
      )
      .lean<LeanProduct[]>(),
  ]);

  return [...atOrAbove, ...below]
    .sort((a, b) => {
      const distance = Math.abs(a.price - price) - Math.abs(b.price - price);
      if (distance !== 0) return distance;
      // Same distance (a tie above and below, or identical prices): newest wins.
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    })
    .slice(0, limit)
    .map(toPublicProduct);
}

/**
 * Looks up a single product for the storefront detail page. Filters on
 * Published so a Draft or Archived slug 404s instead of leaking.
 */
export async function getPublicProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const normalised = slug.trim().toLowerCase();
  if (!normalised) return null;

  await connectDB();
  // Referenced so the "Category" model is registered before populate runs.
  void Category;

  const product = await Product.findOne({
    slug: normalised,
    status: "Published",
  })
    .populate<{ category: { _id: Types.ObjectId; name: string } | null }>(
      "category",
      "name",
    )
    .lean<LeanProduct | null>();

  return product ? toProductDetail(product) : null;
}
