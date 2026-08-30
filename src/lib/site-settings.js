import { cache } from "react";
import { getCmsText } from "@/lib/cms-field";
import { resolveLinkHref } from "@/lib/link-utils";
import { siteDefaults } from "@/lib/site-defaults";
import { sanityFetch } from "@/sanity/lib/client";
import { getImageUrl } from "@/sanity/lib/image";
import { settingsQuery } from "@/sanity/lib/queries";

function getText(field, fallback = "") {
  return getCmsText(field, fallback);
}

function normalizeTwitterHandle(handle) {
  const value = getText(handle);
  if (!value) return null;
  return value.startsWith("@") ? value : `@${value}`;
}

function mapSocialLinks(links = []) {
  return (Array.isArray(links) ? links : [])
    .map((item) => {
      const href = typeof item?.href === "string" ? item.href : null;
      if (!href) return null;
      return {
        platform: getText(item?.platform, "Other"),
        href,
      };
    })
    .filter(Boolean);
}

function mapSettingsData(data = {}) {
  const siteName = getText(data.siteName, siteDefaults.siteName);
  const titlePostfix = getText(data.titlePostfix, siteDefaults.titlePostfix);
  const defaultMetaTitle = getText(
    data.defaultMetaTitle,
    siteDefaults.defaultMetaTitle,
  );
  const defaultMetaDescription = getText(
    data.defaultMetaDescription,
    siteDefaults.defaultMetaDescription,
  );
  const accountDisabledPath = data.accountDisabledPath
    ? data.accountDisabledPath.startsWith("/")
      ? data.accountDisabledPath
      : `/${data.accountDisabledPath}`
    : siteDefaults.accountDisabledPath;

  return {
    siteName,
    titlePostfix,
    tagline: getText(data.tagline, siteDefaults.tagline),
    logoLabel: getText(data.logoLabel, siteDefaults.logoLabel),
    logoAccent: getText(data.logoAccent, siteDefaults.logoAccent),
    defaultMetaTitle,
    defaultMetaDescription,
    defaultMetaImageUrl: getImageUrl(data.defaultMetaImage),
    defaultOgTitle: getText(data.defaultOgTitle) || null,
    defaultOgDescription: getText(data.defaultOgDescription) || null,
    siteUrl: getText(data.siteUrl) || null,
    twitterHandle: normalizeTwitterHandle(data.twitterHandle),
    googleSiteVerification: getText(data.googleSiteVerification) || null,
    contactEmail: getText(data.contactEmail) || null,
    contactPhone: getText(data.contactPhone) || null,
    headerCtaLabel: getLinkLabelFromCta(
      data.headerCta,
      siteDefaults.headerCtaLabel,
    ),
    headerCtaHref:
      resolveLinkHref(data.headerCta) || siteDefaults.headerCtaHref,
    footerCopyright: getText(
      data.footerCopyright,
      siteDefaults.footerCopyright,
    ),
    socialLinks: mapSocialLinks(data.socialLinks),
    accountDisabledPath,
    introductionText: Array.isArray(data.introductionText)
      ? data.introductionText
      : siteDefaults.introductionText,
  };
}

function getLinkLabelFromCta(field, fallback) {
  if (typeof field?.label === "string" && field.label.trim()) return field.label;
  return fallback;
}

export const getSiteSettings = cache(async () => {
  const settings = await sanityFetch(settingsQuery);
  if (!settings) return siteDefaults;
  return mapSettingsData(settings);
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
