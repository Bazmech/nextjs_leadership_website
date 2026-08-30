import Header from "@/components/organisms/Header/Header";
import Footer from "@/components/organisms/Footer/Footer";
import ListingBlock from "@/components/organisms/ListingBlock/ListingBlock";
import Section from "@/components/organisms/Section/Section";
import SliceZone from "@/components/organisms/SliceZone/SliceZone";
import {
  ARTICLES_LISTING_FALLBACK_TITLE,
  ARTICLES_PATH,
  mapArticleCards,
} from "@/lib/articles";
import { isUserSignedIn } from "@/lib/session";
import { buildPageMetadata, defaultSiteMetadata } from "@/lib/site-seo";
import { getSiteSettings } from "@/lib/site-settings";
import { sanityFetch } from "@/sanity/lib/client";
import {
  articleListingQuery,
  articlesListQuery,
} from "@/sanity/lib/queries";
import { components } from "@/slices";

export async function generateMetadata() {
  try {
    const [listing, settings] = await Promise.all([
      sanityFetch(articleListingQuery),
      getSiteSettings(),
    ]);

    return buildPageMetadata(
      listing || { title: ARTICLES_LISTING_FALLBACK_TITLE },
      { path: ARTICLES_PATH, settings },
    );
  } catch {
    return defaultSiteMetadata;
  }
}

export default async function ArticleListingPage() {
  const [listing, articles, isSignedIn] = await Promise.all([
    sanityFetch(articleListingQuery),
    sanityFetch(articlesListQuery),
    isUserSignedIn(),
  ]);

  const title = listing?.title || ARTICLES_LISTING_FALLBACK_TITLE;
  const description = listing?.description || "";
  const hasSlices = Array.isArray(listing?.slices) && listing.slices.length > 0;
  const cards = mapArticleCards(articles, { isSignedIn });

  return (
    <>
      <Header />
      <main>
        {hasSlices ? (
          <SliceZone slices={listing.slices} components={components} />
        ) : (
          <Section className="py-24">
            <div className="col-span-12 text-center md:col-span-8 md:col-start-3">
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-6 text-lg leading-relaxed text-muted">
                  {description}
                </p>
              ) : null}
            </div>
          </Section>
        )}
        {cards.length > 0 ? (
          <ListingBlock
            items={cards}
            className={hasSlices ? "py-24" : "pb-24"}
          />
        ) : (
          <Section className={hasSlices ? "py-24" : "pb-24"}>
            <p className="col-span-12 text-center text-muted">
              No articles have been published yet.
            </p>
          </Section>
        )}
      </main>
      <Footer />
    </>
  );
}
