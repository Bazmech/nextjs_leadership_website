import { notFound } from "next/navigation";
import Header from "@/components/organisms/Header/Header";
import Footer from "@/components/organisms/Footer/Footer";
import ArticleHero from "@/components/organisms/ArticleHero/ArticleHero";
import RelatedArticles from "@/components/organisms/RelatedArticles/RelatedArticles";
import SliceZone from "@/components/organisms/SliceZone/SliceZone";
import {
  RELATED_ARTICLES_HEADING,
  articlePath,
  mapArticleCards,
} from "@/lib/articles";
import { isUserSignedIn } from "@/lib/session";
import { buildPageMetadata } from "@/lib/site-seo";
import { getSiteSettings } from "@/lib/site-settings";
import { sanityFetch } from "@/sanity/lib/client";
import {
  articleBySlugQuery,
  articleListingQuery,
  articleSlugsQuery,
} from "@/sanity/lib/queries";
import { components } from "@/slices";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const [article, settings] = await Promise.all([
      sanityFetch(articleBySlugQuery, { slug }),
      getSiteSettings(),
    ]);

    if (!article) return { title: "Article not found" };

    const seo = {
      ...(article.seo || {}),
      noIndex: Boolean(article.protected) || Boolean(article.seo?.noIndex),
    };

    return buildPageMetadata(
      { ...article, seo },
      { path: articlePath(slug), settings },
    );
  } catch {
    return { title: "Article not found" };
  }
}

export async function generateStaticParams() {
  try {
    const articles = await sanityFetch(articleSlugsQuery);
    if (!Array.isArray(articles)) return [];
    return articles
      .filter((article) => article?.slug)
      .map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const [article, listing, isSignedIn] = await Promise.all([
    sanityFetch(articleBySlugQuery, { slug }),
    sanityFetch(articleListingQuery),
    isUserSignedIn(),
  ]);

  if (!article) {
    notFound();
  }

  const locked = Boolean(article.protected) && !isSignedIn;
  const relatedHeading =
    listing?.relatedHeading || RELATED_ARTICLES_HEADING;
  const relatedItems = mapArticleCards(
    (article.relatedArticles || []).filter((item) => item.uid !== slug),
    { isSignedIn },
  );
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(
    articlePath(slug),
  )}`;

  return (
    <>
      <Header />
      <main>
        <ArticleHero
          title={article.title}
          excerpt={article.excerpt}
          publishedAt={article.publishedAt}
          image={article.featuredImage}
          locked={locked}
          signInHref={locked ? signInHref : undefined}
        />
        {locked ? null : (
          <SliceZone slices={article.slices} components={components} />
        )}
        <RelatedArticles heading={relatedHeading} items={relatedItems} />
      </main>
      <Footer />
    </>
  );
}
