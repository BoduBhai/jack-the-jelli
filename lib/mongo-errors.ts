/**
 * Which unique indexes a write collided with, or `[]` when the error isn't a
 * duplicate-key error. Lets an action turn E11000 into a field message instead
 * of a 500 (§6.5).
 */
export function getDuplicateKeyFields(error: unknown): string[] {
  if (typeof error !== "object" || error === null) return [];

  const candidate = error as {
    code?: number;
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
  };
  if (candidate.code !== 11000) return [];

  return Object.keys(candidate.keyPattern ?? candidate.keyValue ?? {});
}
