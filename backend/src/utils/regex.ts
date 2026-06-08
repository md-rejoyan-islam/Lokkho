// Helpers for safely using untrusted user input inside MongoDB `$regex` queries.
//
// Passing raw user input to `$regex` is a ReDoS / regex-injection risk: a crafted
// pattern such as `(a+)+$` can pin the CPU. Always escape first.

// Escape every regex metacharacter so the input is matched literally.
export function escapeRegex(input: unknown): string {
  return String(input ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build a safe, case-insensitive "contains" matcher from untrusted input.
// The length is capped so a pathological value can't blow up the query.
export function containsRegex(input: unknown) {
  return { $regex: escapeRegex(String(input ?? "").slice(0, 200)), $options: "i" };
}
