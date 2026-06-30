import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// Attach to global to survive hot reloads in dev
declare global {
  var _mongooseConn: typeof mongoose | null;
  var _mongoosePromise: Promise<typeof mongoose> | null;
}

let cached = global._mongooseConn;
let promise = global._mongoosePromise;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached) return cached;

  if (!promise) {
    promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    global._mongoosePromise = promise;
  }

  cached = await promise;
  global._mongooseConn = cached;
  return cached;
}
