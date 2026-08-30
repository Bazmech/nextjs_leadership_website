/**
 * Normalize CMS text fields to a plain string.
 */
export function getCmsText(field, fallback = "") {
  if (field == null || field === false) return fallback;
  if (typeof field === "string") return field.trim() || fallback;
  return fallback;
}

export function isPortableText(field) {
  return Array.isArray(field) && field.length > 0;
}
