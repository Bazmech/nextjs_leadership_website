import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";

const builder = createImageUrlBuilder({
  projectId: projectId || "placeholder",
  dataset,
});

export function isSanityImage(image) {
  return Boolean(image?.asset);
}

export function urlFor(source) {
  return builder.image(source);
}

export function getImageUrl(image, width = 1600) {
  if (!isSanityImage(image)) return image?.url ?? null;

  return builder.image(image).width(width).auto("format").url();
}

export function getImageAlt(image, fallback = "") {
  if (!image) return fallback;
  if (typeof image.alt === "string" && image.alt.trim()) return image.alt;
  return fallback;
}
