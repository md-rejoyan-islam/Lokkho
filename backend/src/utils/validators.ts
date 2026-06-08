import { z } from "zod";

/**
 * Reusable Zod building blocks for request-body validation.
 *
 * Goals:
 *  • trim every string (no leading/trailing whitespace surprises)
 *  • bound every string/array length (avoid oversized documents & abuse)
 *  • normalise emails (lower-cased, trimmed)
 *  • validate URLs without rejecting pasted bare domains
 */

// Trimmed, length-bounded REQUIRED string.
export const reqStr = (min: number, max: number, label = "Value") =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} character${min === 1 ? "" : "s"}`)
    .max(max, `${label} must be at most ${max} characters`);

// Trimmed, length-bounded OPTIONAL string (absent or "" both allowed).
export const optStr = (max: number) => z.string().trim().max(max).optional();

// Normalised email (trimmed + lower-cased), RFC-ish length cap.
export const email = () =>
  z.string().trim().toLowerCase().email("Valid email required").max(254);

// Opaque token (email verify / password reset / etc.).
export const token = () => z.string().min(1, "Token required").max(1000);

// Optional URL: absent or "" allowed; otherwise must look like a URL
// (no whitespace, contains a dot). Lenient enough for pasted bare domains.
export const optUrl = (max = 2048) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => v === "" || (!/\s/.test(v) && /\./.test(v)), "Must be a valid URL")
    .optional();

// Optional array of short, non-empty tags.
export const optTags = (maxItems = 30, maxLen = 50) =>
  z.array(z.string().trim().min(1).max(maxLen)).max(maxItems).optional();

// Bounded non-negative integer (e.g. marks, minutes, counts).
export const count = (max = 100000) => z.number().int().nonnegative().max(max);
