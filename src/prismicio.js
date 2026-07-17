import { createClient as baseCreateClient } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import config from "../prismic.config.json";

export const repositoryName =
  process.env.PRISMIC_REPOSITORY || config.repositoryName;

export function createClient(clientConfig = {}) {
  const client = baseCreateClient(repositoryName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    routes: config.routes,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" }
        : { next: { revalidate: 5 } },
    ...clientConfig,
  });

  enableAutoPreviews({ client });

  return client;
}
