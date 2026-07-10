import { asText } from "@prismicio/client";
import { siteDefaults } from "@/lib/site-defaults";
import {
  buildTitleTemplate,
  formatTitleWithPostfix,
  getSiteSettings,
} from "@/lib/prismic-settings";

function getText(field, fallback = "") {
  if (!field) return fallback;
  if (typeof field === "string") return field.trim() || fallback;
  return asText(field)?.trim() || fallback;
}

function getImageUrl(imageField) {
  return imageField?.url ?? null;
}

function buildAbsoluteUrl(path, siteUrl) {
  if (!path) return siteUrl || undefined;
  if (path.startsWith("http")) return path;
  if (!siteUrl) return path;

  const base = siteUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function buildSocialMetadata(settings) {
  const metadata = {};

  if (settings.twitterHandle) {
    metadata.twitter = {
      site: settings.twitterHandle,
      creator: settings.twitterHandle,
    };
  }

  if (settings.googleSiteVerification) {
    metadata.verification = {
      google: settings.googleSiteVerification,
    };
  }

  return metadata;
}

export function buildPrismicMetadata(document, { path, settings } = {}) {
  const siteSettings = settings ?? siteDefaults;
  const data = document?.data ?? {};
  const pageTitle = getText(data.title);
  const explicitMetaTitle = getText(data.meta_title);
  const title = explicitMetaTitle
    ? { absolute: explicitMetaTitle }
    : pageTitle || undefined;
  const metaDescription =
    getText(data.meta_description) || siteSettings.defaultMetaDescription || undefined;
  const resolvedTitle =
    explicitMetaTitle || (pageTitle ? formatTitleWithPostfix(pageTitle, siteSettings) : siteSettings.defaultMetaTitle);
  const ogTitle =
    getText(data.og_title) ||
    siteSettings.defaultOgTitle ||
    resolvedTitle;
  const ogDescription =
    getText(data.og_description) ||
    siteSettings.defaultOgDescription ||
    metaDescription;
  const ogImageUrl = getImageUrl(data.meta_image) || siteSettings.defaultMetaImageUrl;
  const canonicalUrl =
    getText(data.canonical_url) || buildAbsoluteUrl(path, siteSettings.siteUrl) || undefined;

  return {
    title,
    description: metaDescription,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    robots: data.no_index
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription || undefined,
      type: "website",
      siteName: siteSettings.siteName,
      url: canonicalUrl || path || undefined,
      images: ogImageUrl
        ? [{ url: ogImageUrl, width: 1200, height: 630, alt: ogTitle }]
        : undefined,
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title: ogTitle,
      description: ogDescription || undefined,
      images: ogImageUrl ? [ogImageUrl] : undefined,
      ...(siteSettings.twitterHandle
        ? { site: siteSettings.twitterHandle, creator: siteSettings.twitterHandle }
        : {}),
    },
    ...(siteSettings.googleSiteVerification
      ? { verification: { google: siteSettings.googleSiteVerification } }
      : {}),
  };
}

export async function buildRootMetadata() {
  const settings = await getSiteSettings();

  return {
    title: {
      default: settings.defaultMetaTitle,
      template: buildTitleTemplate(settings),
    },
    description: settings.defaultMetaDescription,
    metadataBase: settings.siteUrl ? new URL(settings.siteUrl) : undefined,
    openGraph: {
      title: settings.defaultOgTitle || settings.defaultMetaTitle,
      description: settings.defaultOgDescription || settings.defaultMetaDescription,
      type: "website",
      siteName: settings.siteName,
      images: settings.defaultMetaImageUrl
        ? [
            {
              url: settings.defaultMetaImageUrl,
              width: 1200,
              height: 630,
              alt: settings.defaultMetaTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: settings.defaultMetaImageUrl ? "summary_large_image" : "summary",
      title: settings.defaultOgTitle || settings.defaultMetaTitle,
      description: settings.defaultOgDescription || settings.defaultMetaDescription,
      images: settings.defaultMetaImageUrl ? [settings.defaultMetaImageUrl] : undefined,
      ...(settings.twitterHandle
        ? { site: settings.twitterHandle, creator: settings.twitterHandle }
        : {}),
    },
    ...buildSocialMetadata(settings),
  };
}

export async function buildSimplePageMetadata(title, description) {
  const settings = await getSiteSettings();

  return {
    title,
    description: description || settings.defaultMetaDescription,
    ...buildSocialMetadata(settings),
  };
}

export const defaultSiteMetadata = {
  title: { absolute: siteDefaults.defaultMetaTitle },
  description: siteDefaults.defaultMetaDescription,
};
