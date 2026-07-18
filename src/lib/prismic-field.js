import { asText } from "@prismicio/client";

/**
 * Normalize Prismic Text (string) or StructuredText fields to a plain string.
 * `asText` only accepts rich text — calling it on Key Text throws during SSR/build.
 */
export function getPrismicText(field, fallback = "") {
  if (field == null || field === false) return fallback;
  if (typeof field === "string") return field.trim() || fallback;
  if (Array.isArray(field)) return asText(field)?.trim() || fallback;
  return fallback;
}
