// Import both models from here so `ref: "Category"` always resolves, whatever
// order the consuming module happens to pull them in.
import Category from "./Category";
import Product from "./Product";
import User from "./User";

export { Category, Product, User };
export type { ICategory } from "./Category";
export type { IProduct, IProductImage, ProductStatus } from "./Product";
export { PRODUCT_STATUSES } from "./Product";
export type { IUser, UserRole } from "./User";
export { USER_ROLES } from "./User";
