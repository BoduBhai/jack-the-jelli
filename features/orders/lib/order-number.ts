import { randomInt } from "node:crypto";

// Server-only: pulls in node:crypto.

/**
 * 30 characters — the full alphanumeric set minus 0, O, 1, I, L and U.
 *
 * Order numbers are read aloud during the confirmation call and copied into
 * /track by hand, so every visually or aurally ambiguous character is removed.
 * (U goes because "you" / "V" collide over a bad line.)
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

const SUFFIX_LENGTH = 4;

/** YYMMDD in local time — the shop's day, not UTC's. */
function datePrefix(now: Date): string {
  const yy = String(now.getFullYear() % 100).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/**
 * A candidate order number, e.g. `JJ-250805-K3M9`.
 *
 * Random rather than an atomic counter: a counter was built and deliberately
 * reverted earlier in this project, and it also leaks daily order volume to
 * anyone who buys twice. 30^4 = 810,000 suffixes per day makes a same-day
 * collision vanishingly unlikely — and the unique index plus a retry at the
 * call site is what actually guarantees uniqueness, so this only has to be
 * unlikely, not certain.
 *
 * Deliberately NOT a pre("validate") hook: a hook can't tell which unique
 * index collided, and the retry has to live at the call site regardless.
 */
export function generateOrderNumber(now: Date = new Date()): string {
  let suffix = "";
  for (let i = 0; i < SUFFIX_LENGTH; i += 1) {
    // randomInt over Math.random: uniform, and this ends up in a URL people
    // can guess at.
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `JJ-${datePrefix(now)}-${suffix}`;
}

/** How many times a caller should re-roll before giving up on E11000. */
export const ORDER_NUMBER_ATTEMPTS = 5;

/** Loose shape check for user-supplied order numbers (the /track input). */
export const ORDER_NUMBER_PATTERN = new RegExp(
  `^JJ-\\d{6}-[${ALPHABET}]{${SUFFIX_LENGTH}}$`,
);
