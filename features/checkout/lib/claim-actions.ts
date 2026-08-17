"use server";

import { Types } from "mongoose";
import { getSession } from "@/lib/auth-guard";
import { connectDB } from "@/lib/db";
import { getUsersCollection } from "@/lib/users";
import { Order } from "@/models";
import { hasReceiptFor } from "@/features/checkout/lib/receipt";
import { ORDER_NUMBER_PATTERN } from "@/features/orders/lib/order-number";

/**
 * Attach one just-placed guest order to the account created from the
 * confirmation screen.
 *
 * This is the companion to claimGuestOrders() (features/orders/lib/orders.ts),
 * which matches on a *verified* email and runs on every sign-in. That one can't
 * serve this flow: the email is optional at checkout, so a guest who left it
 * blank has an order with no `guestEmail` to match on, and even when they did
 * give one there's no promise they register with the same address.
 *
 * What entitles the claim here is the signed `jtj_receipt` cookie — the same
 * proof that lets /checkout/success show this order's full address and phone.
 * It says "this browser placed this order", which is a stronger, narrower claim
 * than "someone controls this mailbox", and it's scoped to a single order
 * rather than to a whole history. That's why an unverified account is allowed
 * to receive it: nothing about the email is being trusted at all.
 */

/** How fresh a user document must be to receive an order with no session. */
const SIGNUP_WINDOW_MS = 5 * 60 * 1000;

export async function claimReceiptOrder(
  orderNumber: string,
  /**
   * The address just registered. Only consulted when there is no session —
   * sign-up can't create one while requireEmailVerification is on.
   */
  signupEmail?: string,
): Promise<{ claimed: boolean }> {
  const normalised = orderNumber.trim().toUpperCase();
  if (!ORDER_NUMBER_PATTERN.test(normalised)) return { claimed: false };

  // The entitlement check. Everything below is a no-op without it.
  if (!(await hasReceiptFor(normalised))) return { claimed: false };

  const userId = await resolveUserId(signupEmail);
  if (!userId) return { claimed: false };

  await connectDB();

  const result = await Order.updateOne(
    // Same guards claimGuestOrders uses: never take an order that already
    // belongs to someone, and never resurrect one whose customer was deleted.
    { orderNumber: normalised, userId: null, customerDeletedAt: null },
    { $set: { userId } },
  );

  return { claimed: result.modifiedCount > 0 };
}

async function resolveUserId(
  signupEmail: string | undefined,
): Promise<Types.ObjectId | null> {
  const session = await getSession();
  if (session) {
    return Types.ObjectId.isValid(session.user.id)
      ? new Types.ObjectId(session.user.id)
      : null;
  }

  const email = signupEmail?.trim().toLowerCase();
  if (!email) return null;

  const users = await getUsersCollection();
  const user = await users.findOne({ email });
  if (!user) return null;

  // Without this window, typing a stranger's address into the sign-up form
  // would hand them your order — sign-up answers a duplicate address with a
  // success response (so it can't be used to probe which emails exist), and
  // the caller can't tell that no account was created. Requiring the document
  // to have been written seconds ago means only an account this same flow just
  // made can receive the order. Accounts predating Better Auth stamping
  // `createdAt` have none, and are refused rather than assumed fresh.
  const createdAt = user.createdAt?.getTime();
  if (!createdAt || Date.now() - createdAt > SIGNUP_WINDOW_MS) return null;

  return new Types.ObjectId(user._id.toHexString());
}
