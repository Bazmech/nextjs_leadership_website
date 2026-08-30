export function resolveLinkHref(field, fallback = null) {
  if (!field) return fallback;
  if (typeof field === "string") return field.trim() || fallback;
  if (field.internalSlug) return `/${field.internalSlug}`;
  if (typeof field.href === "string" && field.href.trim()) return field.href;
  return fallback;
}

export function isFilledLink(field) {
  return Boolean(resolveLinkHref(field));
}

export function getLinkTarget(field, target) {
  if (target) return target;
  if (field?.openInNewTab) return "_blank";
  if (field?.target) return field.target;
  const href = resolveLinkHref(field);
  if (href?.startsWith("http://") || href?.startsWith("https://")) {
    return "_blank";
  }
  return undefined;
}

export function getLinkLabel(field, fallback = "Learn more") {
  if (typeof field?.label === "string" && field.label.trim()) return field.label;
  if (typeof field?.text === "string" && field.text.trim()) return field.text;
  return fallback;
}
