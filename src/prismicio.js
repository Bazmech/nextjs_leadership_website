import { createClient as baseCreateClient } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import sm from "../slicemachine.config.json";

export const repositoryName =
  process.env.PRISMIC_REPOSITORY || sm.repositoryName;

const routes = [
  { type: "homepage", path: "/" },
  { type: "page", path: "/:uid" },
];

export function createClient(config = {}) {
  const client = baseCreateClient(repositoryName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    routes,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" }
        : { next: { revalidate: 5 } },
    ...config,
  });

  enableAutoPreviews({ client });

  return client;
}
