import mongoose from "mongoose";
import { ObjectId, type Db, type MongoClient } from "mongodb";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectDB } from "@/lib/db";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { getUsersCollection } from "@/lib/users";
import { claimGuestOrders } from "@/features/orders/lib/orders";

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
  databaseHooks: {
    session: {
      create: {
        // Every sign-in creates a session, which makes this the one place that
        // reliably fires on sign-in however the user got there — password,
        // Google, or auto-sign-in after verification.
        after: async (session) => {
          try {
            const users = await getUsersCollection();
            const user = await users.findOne({
              _id: new ObjectId(session.userId),
            });
            // Only a verified address may claim orders: an unverified one
            // would let anyone sign up as someone else's email and inherit
            // their order history, address and phone number with it.
            if (!user?.emailVerified || !user.email) return;

            await claimGuestOrders(session.userId, user.email);
          } catch (error) {
            // Claiming past orders is a convenience. It must never be the
            // reason a sign-in fails.
            console.error("claimGuestOrders failed on sign-in", error);
          }
        },
      },
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
