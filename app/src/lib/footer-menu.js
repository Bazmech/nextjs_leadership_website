import { cache } from "react";
import { resolveCmsMenuLinks } from "@/lib/header-menu";
import { sanityFetch } from "@/sanity/lib/client";
import { footerMenuQuery } from "@/sanity/lib/queries";

export const getFooterMenuDocument = cache(async () => {
  return sanityFetch(footerMenuQuery);
});

/** Footer nav tree for the current session, filtered by cascading role visibility. */
export const getFooterMenuLinks = cache(async () => {
  const document = await getFooterMenuDocument();
  return resolveCmsMenuLinks(document?.menuItems);
});
