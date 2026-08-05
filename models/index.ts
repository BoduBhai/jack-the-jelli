// Import both models from here so `ref: "Category"` always resolves, whatever
// order the consuming module happens to pull them in.
import Category from "./Category";
import Product from "./Product";

export { Category, Product };
export type { ICategory } from "./Category";
export type { IProduct, IProductImage, ProductStatus } from "./Product";
export { PRODUCT_STATUSES } from "./Product";
