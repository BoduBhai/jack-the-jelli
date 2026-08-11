import { cache } from "react";
import { Types, type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import { escapeRegex } from "@/lib/slug";
import { Category, Product, type IProduct } from "@/models";
import {
  DEFAULT_SORT,
  PRODUCTS_PER_PAGE,
  type SortOption,
} from "@/features/products/lib/constants";
import type {
  Product as PublicProduct,
  ProductDetail,
} from "@/features/products/lib/types";

// Server-only: pulls in Mongoose. Returns plain, serializable objects since
// Mongoose docs don't cross the server/client boundary (§6.3).

// `_id` breaks ties on every sort. Without it Mongo's ordering is unstable
// between the separate skip/limit queries that back "Discover More", so two
// products at the same price could both appear on page 1 and page 2 while a
// third never appears at all.
const SORT_MAP: Record<SortOption, Record<string, 1 | -1>> = {
  newest: { createdAt: -1, _id: -1 },
  "price-asc": { price: 1, _id: 1 },
  "price-desc": { price: -1, _id: 1 },
};

type PopulatedCategory = { _id: Types.ObjectId; name: string } | null;

/** A lean product with its category ref resolved by populate. */
type LeanProduct = Omit<IProduct, "category"> & {
  _id: Types.ObjectId;
  category: PopulatedCategory;
};

/** The one place the populate/lean incantation lives. */
function findLeanProducts(
  filter: QueryFilter<IProduct>,
  {
    sort,
    skip = 0,
    limit,
  }: { sort: Record<string, 1 | -1>; skip?: number; limit: number },
): Promise<LeanProduct[]> {
  return Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate<{ category: PopulatedCategory }>("category", "name")
    .lean<LeanProduct[]>();
}

function toPublicProduct(product: LeanProduct): PublicProduct {
  return {
    id: String(product._id),
    slug: product.slug,
    name: product.name,
    price: product.price,
    thumbnail: product.thumbnail,
    // A category deleted out from under a product shouldn't crash the grid.
    category: product.category?.name ?? "Uncategorised",
    stock: product.stock,
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

/**
 * Categories are addressed by slug, never by `_id` — an ObjectId in a link is
 * unreadable and, worse, only valid against the database it was copied from.
 */
async function resolveCategoryId(
  slug: string | undefined,
): Promise<Types.ObjectId | null> {
  const normalised = slug?.trim().toLowerCase();
  if (!normalised) return null;

  const category = await Category.findOne({ slug: normalised })
    .select("_id")
    .lean<{ _id: Types.ObjectId } | null>();

  return category?._id ?? null;
}

export interface PublicProductQuery {
  q?: string;
  categorySlug?: string;
  sort?: SortOption;
  page?: number;
}

export interface PublicProductListResult {
  products: PublicProduct[];
  total: number;
  page: number;
  totalPages: number;
}

const EMPTY_RESULT: PublicProductListResult = {
  products: [],
  total: 0,
  page: 1,
  totalPages: 1,
};

export async function getPublicProducts({
  q,
  categorySlug,
  sort = DEFAULT_SORT,
  page = 1,
}: PublicProductQuery): Promise<PublicProductListResult> {
  await connectDB();

  const filter: QueryFilter<IProduct> = { status: "Published" };

  const search = q?.trim();
  if (search) {
    // Escaped so a stray "(" in the search box can't throw a regex error.
    filter.name = new RegExp(escapeRegex(search), "i");
  }

  if (categorySlug?.trim()) {
    const categoryId = await resolveCategoryId(categorySlug);
    // An unknown slug matches nothing, rather than silently showing everything.
    if (!categoryId) return EMPTY_RESULT;
    filter.category = categoryId;
  }

  const total = await Product.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const products = await findLeanProducts(filter, {
    sort: SORT_MAP[sort] ?? SORT_MAP[DEFAULT_SORT],
    skip: (currentPage - 1) * PRODUCTS_PER_PAGE,
    limit: PRODUCTS_PER_PAGE,
  });

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

  const base: QueryFilter<IProduct> = {
    status: "Published",
    _id: { $ne: new Types.ObjectId(productId) },
  };

  const [atOrAbove, below] = await Promise.all([
    findLeanProducts(
      { ...base, price: { $gte: price } },
      { sort: { price: 1, createdAt: -1, _id: 1 }, limit },
    ),
    findLeanProducts(
      { ...base, price: { $lt: price } },
      { sort: { price: -1, createdAt: -1, _id: 1 }, limit },
    ),
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
 *
 * Wrapped in React's `cache` because both `generateMetadata` and the page body
 * need it — Next dedupes `fetch`, but not arbitrary async functions, so without
 * this every product view costs two identical round trips.
 */
export const getPublicProductBySlug = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    const normalised = slug.trim().toLowerCase();
    if (!normalised) return null;

    await connectDB();

    const product = await Product.findOne({
      slug: normalised,
      status: "Published",
    })
      .populate<{ category: PopulatedCategory }>("category", "name")
      .lean<LeanProduct | null>();

    return product ? toProductDetail(product) : null;
  },
);
