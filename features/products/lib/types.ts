/** The grid/card payload. Kept to exactly what a card renders — every extra
 *  field here is shipped to the browser for every product on the page. */
export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  thumbnail?: string;
  category: string;
  /** Earns its place: the card's add-to-cart button needs it to seed the line. */
  stock: number;
}

/** One image on the detail page. Mirrors IProductImage without the Mongoose types. */
export interface ProductImage {
  url: string;
  publicId: string;
}

/**
 * The richer shape the product detail page needs. Kept separate from Product so
 * the collection grid keeps shipping the smaller payload.
 */
export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description?: string;
  stock: number;
  thumbnail?: string;
  images: ProductImage[];
}
