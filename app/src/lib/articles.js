export const ARTICLES_PATH = "/articles";
export const ARTICLES_ROUTE_SLUG = "articles";
export const ARTICLES_LISTING_FALLBACK_TITLE = "Articles";
export const RELATED_ARTICLES_HEADING = "Related articles";

export function articlePath(uid) {
  if (!uid) return ARTICLES_PATH;
  return `${ARTICLES_PATH}/${uid}`;
}

export function toArticleCardProps(article, { isSignedIn } = {}) {
  const uid = article?.uid;
  const locked = Boolean(article?.protected) && !isSignedIn;

  return {
    title: article?.title || "Untitled article",
    image: article?.featuredImage,
    excerpt: article?.excerpt || "",
    locked,
    linkHref: locked || !uid ? undefined : articlePath(uid),
    linkLabel: locked ? "Members only" : "Read article",
  };
}

export function mapArticleCards(articles, options) {
  if (!Array.isArray(articles)) return [];
  return articles
    .filter((article) => article?.uid)
    .map((article) => toArticleCardProps(article, options));
}
