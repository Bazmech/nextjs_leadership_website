const INTERNAL_SLUG_PROJECTION = `"internalSlug": select(
  internalPage->_type == "article" => "articles/" + internalPage->slug.current,
  internalPage->slug.current
)`;

const LINK_PROJECTION = `{
  label,
  href,
  openInNewTab,
  ${INTERNAL_SLUG_PROJECTION}
}`;

const ARTICLE_CARD_PROJECTION = `{
  title,
  excerpt,
  protected,
  publishedAt,
  featuredImage,
  "uid": slug.current
}`;

const PORTABLE_TEXT_PROJECTION = `[]{
  ...,
  markDefs[]{
    ...,
    _type == "link" => {
      ...,
      ${INTERNAL_SLUG_PROJECTION}
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

const MENU_ITEMS_PROJECTION = `{
  menuItems[]{
    label,
    requiredRole,
    parentLabel,
    link ${LINK_PROJECTION}
  }
}`;

export const headerMenuQuery = `*[_type == "headerMenu" && _id == "headerMenu"][0] ${MENU_ITEMS_PROJECTION}`;

export const footerMenuQuery = `*[_type == "footerMenu" && _id == "footerMenu"][0] ${MENU_ITEMS_PROJECTION}`;

export const articleListingQuery = `*[_type == "articleListing" && _id == "articleListing"][0]{
  title,
  description,
  relatedHeading,
  slices[] ${SLICE_PROJECTION},
  seo ${SEO_PROJECTION}
}`;

export const articlesListQuery = `*[_type == "article" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) ${ARTICLE_CARD_PROJECTION}`;

export const articleBySlugQuery = `*[_type == "article" && slug.current == $slug][0]{
  _id,
  title,
  "uid": slug.current,
  excerpt,
  protected,
  publishedAt,
  featuredImage,
  slices[] ${SLICE_PROJECTION},
  seo ${SEO_PROJECTION},
  "relatedArticles": select(
    count(relatedArticles) > 0 => relatedArticles[]->[defined(slug.current)]${ARTICLE_CARD_PROJECTION},
    *[_type == "article" && defined(slug.current) && _id != ^._id] | order(coalesce(publishedAt, _createdAt) desc) [0...3] ${ARTICLE_CARD_PROJECTION}
  )
}`;

export const articleSlugsQuery = `*[_type == "article" && defined(slug.current)]{
  "slug": slug.current
}`;
