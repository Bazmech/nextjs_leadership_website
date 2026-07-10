export function isFilledLink(field) {
  return Boolean(field && (field.url || field.link_type === "Document"));
}

export function resolveLinkHref(field, fallback = null) {
  if (field?.link_type === "Web" && field.url) return field.url;
  if (field?.link_type === "Document" && field.url) return field.url;
  return fallback;
}

export function getLinkTarget(field, target) {
  if (target) return target;
  if (field?.target) return field.target;
  if (field?.link_type === "Web" && field?.url?.startsWith("http")) {
    return "_blank";
  }
  return undefined;
}

export function getLinkLabel(field, fallback = "Learn more") {
  if (field?.text) return field.text;
  if (field?.url) return fallback;
  return fallback;
}
