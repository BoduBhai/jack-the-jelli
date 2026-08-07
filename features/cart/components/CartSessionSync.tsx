"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { revalidateCart } from "@/features/cart/lib/cart-actions";
import { saveCart, syncCartOnSignIn } from "@/features/cart/lib/cart-sync";
import { useCartHydrated, useCartStore } from "@/features/cart/lib/cartStore";

/**
 * Keeps the browser's cart honest about whose it is, and mirrors it to the
 * saved cart while someone is signed in. Renders nothing; mounted once in the
 * NavBar so it runs on every storefront route and survives client navigations.
 *
 * The leak it exists to close: localStorage has no notion of a session, so
 * without this a cart added by one account is still sitting there for the next
 * person to sign in on that browser. A server-side cart alone does not fix it —
 * a signed-out browser has nothing *but* localStorage to fall back on.
 */

/** Debounce for the mirror. Long enough to fold a stepper being held down. */
const SAVE_DELAY_MS = 500;

/** The saved cart's whole content, for telling a real change from a reprice. */
function linesKey(lines: { productId: string; qty: number }[]): string {
  return lines.map((line) => `${line.productId}:${line.qty}`).join(",");
}

export default function CartSessionSync() {
  const { data, isPending } = authClient.useSession();
  const hydrated = useCartHydrated();
  const userId = data?.user?.id ?? null;

  // Settle who the cart belongs to.
  useEffect(() => {
    // Both gates are load-bearing. Before the session resolves `data` is null,
    // which is indistinguishable from signed-out — acting on it would wipe a
    // signed-in shopper's cart on every page load. And before the persisted
    // cart is read back, `ownerId` is still the default null, so a signed-in
    // reader would look like a guest and hand the saved cart away.
    if (!hydrated || isPending) return;

    // getState() rather than a subscription, for the reason spelled out in
    // useCartRevalidation: this effect writes the very fields it would be
    // watching, and would re-fire on its own result.
    const store = useCartStore.getState();
    const ownerId = store.ownerId ?? null;
    if (ownerId === userId) return;

    if (userId === null) {
      // Signed out. The items are safe in Mongo under the old owner, so this
      // drops the local copy rather than deleting anything.
      store.resetForSignOut();
      return;
    }

    // Only a cart with *no* owner is offered up. A cart stamped with a
    // different account must never be handed to whoever signs in next — that
    // is the leak itself, and "guest cart wins" was never a licence to hand
    // one shopper's pieces to another.
    const guestItems =
      ownerId === null
        ? store.items.map((line) => ({
            productId: line.productId,
            qty: line.qty,
          }))
        : [];
    const displaced = ownerId !== null && store.items.length > 0;

    let cancelled = false;

    syncCartOnSignIn(guestItems)
      .then((lines) => {
        // A null return means the session vanished between the render and the
        // action — leave the cart alone rather than adopting on a guess.
        if (cancelled || lines === null) return;
        useCartStore.getState().adoptCart(userId, lines);

        if (displaced) {
          toast("Loaded the cart saved to this account.", {
            description: "The pieces from the previous session were cleared.",
          });
        }

        // The adopted lines are ids and quantities — the server stores nothing
        // else — so they carry no name, price or thumbnail. Fill them in now
        // rather than waiting for the sheet to be opened, or the badge would
        // count pieces the cart can't yet name.
        if (lines.length === 0) return;
        return revalidateCart(lines.map((line) => line.productId)).then(
          (snapshots) => {
            if (!cancelled) useCartStore.getState().reconcile(snapshots);
          },
        );
      })
      .catch(() => {
        // The saved cart is unreachable. Clearing the local one would be the
        // destructive choice, so the cart stays put and unstamped; the next
        // load tries again.
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, isPending, userId]);

  // Mirror every mutation to the saved cart.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    // One subscription rather than a call inside each action, so addItem,
    // setQty, removeItem, reconcile and clear — including the post-order clear
    // in ClearCartOnMount — are all covered without the store doing I/O.
    const unsubscribe = useCartStore.subscribe((state, previous) => {
      // A guest has nowhere to save to, and an unsettled cart must not be
      // written under an owner it hasn't been checked against yet.
      if (state.ownerId === null || state.ownerId !== userId) return;
      // The owner changing *is* adoptCart landing. The server already holds
      // exactly these lines — it is where they just came from — so echoing
      // them straight back would be a wasted round trip.
      if (state.ownerId !== previous.ownerId) return;

      const lines = state.items.map((line) => ({
        productId: line.productId,
        qty: line.qty,
      }));
      // Compared by content, not by reference: reconcile() rebuilds the array
      // on every cart-sheet open, and a refresh that changed only a price is
      // not a cart change worth a write.
      if (linesKey(lines) === linesKey(previous.items)) return;

      clearTimeout(timer);
      timer = setTimeout(() => {
        // Swallowed on purpose: localStorage is what this device renders from,
        // so a failed write costs nothing until the shopper switches devices,
        // and the next mutation retries.
        void saveCart(lines).catch(() => {});
      }, SAVE_DELAY_MS);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [userId]);

  return null;
}
