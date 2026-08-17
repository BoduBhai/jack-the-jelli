import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth-guard";
import { claimReceiptOrder } from "@/features/checkout/lib/claim-actions";

/**
 * Where Google sign-up lands when it was started from the confirmation screen.
 *
 * OAuth can only hand control back with a GET, so this mutates on GET — which
 * is normally wrong. It's bounded here: claimReceiptOrder does nothing without
 * the signed receipt cookie for this exact order, so the worst a forged link
 * can achieve is attaching the visitor's own order to the visitor's own
 * account. Requiring a session as well keeps it off the password path, which
 * has no session at sign-up and goes through the server action instead.
 */
export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("order")?.trim() ?? "";

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  }

  let claimed = false;
  try {
    ({ claimed } = await claimReceiptOrder(orderNumber));
  } catch (error) {
    // Same rule as the sign-in hook: claiming is a convenience and must never
    // be the reason someone lands on an error page after signing in.
    console.error("claimReceiptOrder failed on OAuth return", error);
  }

  // Whether or not it landed, My Orders is the right destination — it either
  // shows the order or shows that it isn't there, which is the honest answer.
  return NextResponse.redirect(
    new URL(
      claimed ? "/my-orders?claimed=1" : "/my-orders",
      request.nextUrl.origin,
    ),
  );
}
