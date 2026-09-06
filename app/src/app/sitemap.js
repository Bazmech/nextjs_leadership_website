import {
  ARTICLES_PATH,
  ARTICLES_ROUTE_SLUG,
  articlePath,
} from "@/lib/articles";
import {
  getSiteSettings,
  resolveCanonicalSiteUrl,
} from "@/lib/site-settings";
import { sanityFetch } from "@/sanity/lib/client";
import {
  sitemapArticleListingQuery,
  sitemapArticlesQuery,
  sitemapHomepageQuery,
  sitemapPagesQuery,
} from "@/sanity/lib/queries";

const PRIVATE_PATH_PREFIXES = [
  "/dashboard",
  "/studio",
  "/sign-in",
  "/sign-up",
  "/api",
];

function toSitemapEntry(siteUrl, path, lastModified) {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  const url = normalized === "/" ? siteUrl : `${siteUrl}${normalized}`;
  const entry = { url };

  if (lastModified) {
    entry.lastModified = new Date(lastModified);
  }

  return entry;
}

function isPrivatePath(path, accountDisabledPath) {
  if (accountDisabledPath && path === accountDisabledPath) return true;

  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export default async function sitemap() {
  const [settings, homepage, listing, pages, articles] = await Promise.all([
    getSiteSettings(),
    sanityFetch(sitemapHomepageQuery),
    sanityFetch(sitemapArticleListingQuery),
    sanityFetch(sitemapPagesQuery),
    sanityFetch(sitemapArticlesQuery),
  ]);

  const siteUrl = resolveCanonicalSiteUrl(settings.siteUrl);
  const entries = [];

  if (!homepage?.noIndex) {
    entries.push(toSitemapEntry(siteUrl, "/", homepage?._updatedAt));
  }

  if (!listing?.noIndex) {
    entries.push(
      toSitemapEntry(siteUrl, ARTICLES_PATH, listing?._updatedAt),
    );
  }

  for (const page of Array.isArray(pages) ? pages : []) {
    const uid = page?.uid;
    if (!uid || uid === ARTICLES_ROUTE_SLUG) continue;

    const path = `/${uid}`;
    if (isPrivatePath(path, settings.accountDisabledPath)) continue;

    entries.push(toSitemapEntry(siteUrl, path, page._updatedAt));
  }

  for (const article of Array.isArray(articles) ? articles : []) {
    if (!article?.slug) continue;

    entries.push(
      toSitemapEntry(
        siteUrl,
        articlePath(article.slug),
        article._updatedAt || article.publishedAt,
      ),
    );
  }

  return entries;
}
