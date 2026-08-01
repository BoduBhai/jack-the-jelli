import mongoose, { Schema } from "mongoose";
import { slugify } from "@/lib/slug";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

// Unlike Product, the slug is NOT de-duplicated: two categories with the same
// name are a mistake, so we let the unique index reject the second one and the
// action translate that E11000 into "this category already exists".
categorySchema.pre("validate", function () {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name ?? "");
  }
});

// Hot-reload guard — without it dev throws OverwriteModelError.
const Category =
  (mongoose.models.Category as mongoose.Model<ICategory>) ||
  mongoose.model<ICategory>("Category", categorySchema);

export default Category;
