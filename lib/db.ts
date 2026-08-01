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

export async function connectDB(): Promise<typeof mongoose> {
  if (global._mongooseConn) return global._mongooseConn;

  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .catch((error) => {
        // Never cache a failed attempt. The cache lives on `global` so it
        // survives hot reloads — which means a rejected promise would be
        // replayed to every later caller, reporting the original error long
        // after the cause (paused cluster, dropped wifi) was fixed. Clearing it
        // lets the next call genuinely retry.
        global._mongoosePromise = null;
        throw error;
      });
  }

  global._mongooseConn = await global._mongoosePromise;
  return global._mongooseConn;
}
