import { cache } from "react";
import { createClient } from "@/prismicio";
import { getPrismicText } from "@/lib/prismic-field";
import { resolveLinkHref } from "@/lib/link-utils";
import { siteDefaults } from "@/lib/site-defaults";

function getText(field, fallback = "") {
  return getPrismicText(field, fallback);
}

function getImageUrl(imageField) {
  return imageField?.url ?? null;
}

function normalizeTwitterHandle(handle) {
  const value = getText(handle);
  if (!value) return null;
  return value.startsWith("@") ? value : `@${value}`;
}

function mapSocialLinks(links = []) {
  return links
    .map((item) => {
      const href = resolveLinkHref(item?.url);
      if (!href) return null;

      return {
        platform: getText(item?.platform, "Other"),
        href,
      };
    })
    .filter(Boolean);
}

/** Normalize a link/document field to an app pathname (e.g. `/account-disabled`). */
function resolveDocumentPathname(field, fallback = null) {
  const href = resolveLinkHref(field);
  if (href) {
    try {
      if (href.startsWith("http://") || href.startsWith("https://")) {
        return new URL(href).pathname || fallback;
      }
    } catch {
      // fall through
    }
    return href.startsWith("/") ? href : `/${href}`;
  }

  if (field?.uid) {
    return `/${field.uid}`;
  }

  return fallback;
}

function mapSettingsData(data = {}) {
  const siteName = getText(data.site_name, siteDefaults.siteName);
  const titlePostfix = getText(data.title_postfix, siteDefaults.titlePostfix);
  const defaultMetaTitle = getText(data.default_meta_title, siteDefaults.defaultMetaTitle);
  const defaultMetaDescription = getText(
    data.default_meta_description,
    siteDefaults.defaultMetaDescription,
  );

  return {
    siteName,
    titlePostfix,
    tagline: getText(data.tagline, siteDefaults.tagline),
    logoLabel: getText(data.logo_label, siteDefaults.logoLabel),
    logoAccent: getText(data.logo_accent, siteDefaults.logoAccent),
    defaultMetaTitle,
    defaultMetaDescription,
    defaultMetaImageUrl: getImageUrl(data.default_meta_image),
    defaultOgTitle: getText(data.default_og_title) || null,
    defaultOgDescription: getText(data.default_og_description) || null,
    siteUrl: getText(data.site_url) || null,
    twitterHandle: normalizeTwitterHandle(data.twitter_handle),
    googleSiteVerification: getText(data.google_site_verification) || null,
    contactEmail: getText(data.contact_email) || null,
    contactPhone: getText(data.contact_phone) || null,
    headerCtaLabel: getText(data.header_cta_label, siteDefaults.headerCtaLabel),
    headerCtaHref: resolveLinkHref(data.header_cta_link) || siteDefaults.headerCtaHref,
    footerCopyright: getText(
      data.footer_copyright,
      siteDefaults.footerCopyright,
    ),
    socialLinks: mapSocialLinks(data.social_links),
    accountDisabledPath:
      resolveDocumentPathname(data.account_disabled_page) ||
      siteDefaults.accountDisabledPath,
    introductionText: Array.isArray(data.introduction_text)
      ? data.introduction_text
      : siteDefaults.introductionText,
  };
}

export const getSiteSettings = cache(async () => {
  try {
    const client = createClient();
    const settings = await client.getSingle("settings");

    return mapSettingsData(settings.data);
  } catch {
    return siteDefaults;
  }
});

export function formatTitleWithPostfix(title, settings = siteDefaults) {
  const value = getText(title);
  if (!value) return settings.defaultMetaTitle;

  const postfix = settings.titlePostfix || siteDefaults.titlePostfix;
  if (!postfix || value.endsWith(postfix.trim())) return value;

  return `${value}${postfix}`;
}

export function buildTitleTemplate(settings = siteDefaults) {
  const postfix = (settings.titlePostfix || siteDefaults.titlePostfix).trim();
  if (!postfix) return "%s";

  const separator = postfix.startsWith("|") ? ` ${postfix}` : postfix;
  return `%s${separator}`;
}
