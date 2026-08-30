import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const fetchOptions =
  process.env.NODE_ENV === "production"
    ? { next: { tags: ["sanity"] }, cache: "force-cache" }
    : { next: { revalidate: 5 } };

export const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;

export async function sanityFetch(query, params = {}) {
  if (!client) return null;

  try {
    return await client.fetch(query, params, fetchOptions);
  } catch (error) {
    console.warn("Sanity fetch failed:", error.message);
    return null;
  }
}
