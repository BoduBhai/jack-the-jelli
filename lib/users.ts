import type { Collection, MongoClient, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

// Mirrors the shape Better Auth's MongoDB adapter writes to the `user`
// collection — not a Mongoose model, since Better Auth owns this collection.
export interface UserDocument {
  _id: ObjectId;
  email: string;
  name: string;
  role: string;
  phone?: string;
  emailVerified: boolean;
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  await connectDB();
  // Same nominal-type workaround as lib/auth.ts: mongoose pins its own
  // nested `mongodb` driver, distinct at the type level (not at runtime)
  // from this repo's top-level `mongodb` package.
  const client = mongoose.connection.getClient() as unknown as MongoClient;
  // Better Auth's adapter writes to the singular `user` collection.
  return client.db().collection<UserDocument>("user");
}
