"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useLinkStatus } from "next/link";

/**
 * The site-wide route-change indicator: a hairline that sweeps across the top
 * of the viewport while a navigation is in flight.
 *
 * Next has no global "am I navigating" signal — `useLinkStatus` is the only
 * supported source, and it has to be called from a descendant of the `<Link>`
 * that was clicked. That's the whole reason this file is split in two: every
 * `AppLink` mounts a `<LinkPending>` that reports into the module-level store
 * below, and the single `<RouteProgress>` in `app/layout.tsx` reads it.
 *
 * A counter rather than a boolean because two links can briefly overlap — an
 * interrupted navigation unmounts its reporter after the next one has already
 * mounted, and a boolean would clear the bar while the second is still going.
 */

let pendingCount = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getIsPending() {
  return pendingCount > 0;
}

/** The server never has a navigation in flight, so the bar never renders in HTML. */
function getIsPendingOnServer() {
  return false;
}

function report(delta: number) {
  const wasPending = getIsPending();
  pendingCount += delta;
  if (getIsPending() === wasPending) return;
  for (const listener of listeners) listener();
}

/**
 * Renders nothing at all — deliberately. Returning `null` keeps it out of the
 * DOM, so dropping it inside links whose class list includes `gap-*` or
 * `justify-between` can't shift what's already there. React only needs it in
 * the tree, not on screen, for `useLinkStatus` to work.
 */
export function LinkPending() {
  const { pending } = useLinkStatus();

  useEffect(() => {
    if (!pending) return;
    report(1);
    return () => report(-1);
  }, [pending]);

  return null;
}

export default function RouteProgress() {
  const isNavigating = useSyncExternalStore(
    subscribe,
    getIsPending,
    getIsPendingOnServer,
  );

  if (!isNavigating) return null;

  return (
    <div
      // The route announcer Next already ships tells assistive tech that the
      // page changed; this is the same information again, in paint.
      aria-hidden="true"
      // Above the h-24 navbar (z-50). scrollbar-lock-safe for the same reason
      // the navbar carries it: this is a fixed full-bleed bar, and navigating
      // from an open cart sheet would otherwise stretch it by the scrollbar's
      // width for a frame.
      className="scrollbar-lock-safe pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden"
    >
      <div className="route-progress-bar bg-foreground h-full w-[28%]" />
    </div>
  );
}
