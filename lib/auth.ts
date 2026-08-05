import mongoose from "mongoose";
import type { Db, MongoClient } from "mongodb";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectDB } from "@/lib/db";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

// mongoose.connection.getClient() throws until the connection is open, so
// this await must run at module scope before betterAuth() is constructed.
await connectDB();
// Mongoose pins its own nested `mongodb` driver (~7.2, see mongoose's own
// package.json) separately from this repo's top-level `mongodb` (^7.4.0,
// what better-auth's types are built against). They're the same driver at
// runtime — npm just can't dedupe the two ranges — so TS sees them as
// nominally distinct classes. Cast once here rather than loosen either
// version pin.
const client = mongoose.connection.getClient() as unknown as MongoClient;

export const auth = betterAuth({
  // Passing { client } (not just the Db) lets the adapter reuse this
  // connection's pool for transactions instead of opening a second one —
  // the Atlas free tier has a connection cap.
  database: mongodbAdapter(client.db() as unknown as Db, { client }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // Password reset is the recovery path for an account someone else may
    // already be inside; leaving their session alive (the default) defeats the
    // point of resetting.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },
  account: {
    accountLinking: { enabled: false }, // manual linking only — see AUTH_IMPLEMENTATION_PLAN.md §3.2
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false, input: true },
      // input: false is the actual server-side enforcement that role can
      // never be self-assigned — see AUTH_IMPLEMENTATION_PLAN.md §3.1.
      role: { type: "string", defaultValue: "customer", input: false },
    },
  },
});
