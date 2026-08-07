import type { OrderDTO } from "@/features/orders/lib/order-types";

/**
 * Return shape for `lookupOrder`. Lives outside the action file because a
 * `"use server"` module may only export async functions.
 */
export interface TrackState {
  /** Whether a lookup has been attempted at all — distinguishes first paint. */
  searched: boolean;
  order?: OrderDTO;
  message?: string;
  values?: { order?: string; phone?: string };
}

export const emptyTrackState: TrackState = { searched: false };
