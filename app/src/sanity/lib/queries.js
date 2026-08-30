const LINK_PROJECTION = `{
  label,
  href,
  openInNewTab,
  "internalSlug": internalPage->slug.current
}`;

const PORTABLE_TEXT_PROJECTION = `[]{
  ...,
  markDefs[]{
    ...,
    _type == "link" => {
      ...,
      "internalSlug": internalPage->slug.current
    }
  }
}`;

const SEO_PROJECTION = `{
  metaTitle,
  metaDescription,
  ogTitle,
  ogDescription,
  canonicalUrl,
  noIndex,
  metaImage
}`;

const SLICE_PROJECTION = `{
  ...,
  text ${PORTABLE_TEXT_PROJECTION},
  primaryCta ${LINK_PROJECTION},
  secondaryCta ${LINK_PROJECTION},
  link ${LINK_PROJECTION},
  items[]{
    ...,
    link ${LINK_PROJECTION}
  }
}`;

export const homepageQuery = `*[_type == "homepage" && _id == "homepage"][0]{
  title,
  slices[] ${SLICE_PROJECTION},
  seo ${SEO_PROJECTION}
}`;

export const pageBySlugQuery = `*[_type == "page" && slug.current == $uid][0]{
  title,
  "uid": slug.current,
  slices[] ${SLICE_PROJECTION},
  seo ${SEO_PROJECTION}
}`;

export const pageSlugsQuery = `*[_type == "page" && defined(slug.current)]{
  "uid": slug.current
}`;

export const settingsQuery = `*[_type == "settings" && _id == "settings"][0]{
  siteName,
  titlePostfix,
  tagline,
  logoLabel,
  logoAccent,
  defaultMetaTitle,
  defaultMetaDescription,
  defaultMetaImage,
  defaultOgTitle,
  defaultOgDescription,
  siteUrl,
  twitterHandle,
  googleSiteVerification,
  contactEmail,
  contactPhone,
  headerCta ${LINK_PROJECTION},
  footerCopyright,
  socialLinks[]{
    platform,
    href
  },
  "accountDisabledPath": accountDisabledPage->slug.current,
  introductionText ${PORTABLE_TEXT_PROJECTION}
}`;

export const headerMenuQuery = `*[_type == "headerMenu" && _id == "headerMenu"][0]{
  menuItems[]{
    label,
    requiredRole,
    parentLabel,
    link ${LINK_PROJECTION}
  }
}`;
