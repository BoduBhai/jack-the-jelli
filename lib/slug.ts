// URL slug helpers shared by the Mongoose models.

// Combining marks left behind by NFKD normalisation ("é" -> "e" + U+0301).
// Built from a string so the range stays legible in source.
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

/** Lowercase, strip accents, collapse every non-alphanumeric run into a dash. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Escape a string for safe interpolation into a RegExp. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
