import mongoose, { Schema } from "mongoose";

export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser {
  name: string;
  /** Optional — this is a phone-first COD store (Phase 1). */
  email?: string;
  phone: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      // Sparse so multiple users may omit an email while set ones stay unique.
      unique: true,
      sparse: true,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    // Never returned by default (Phase 1: "ensure password is not exposed").
    // Use .select("+password") when verifying a login.
    password: { type: String, required: true, select: false },
    // Assigned manually — there is no self-service admin signup.
    role: { type: String, enum: USER_ROLES, default: "customer", index: true },
  },
  { timestamps: true },
);

// Hot-reload guard — without it dev throws OverwriteModelError.
const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);

export default User;
