import {
  getSiteSettings,
  resolveCanonicalSiteUrl,
} from "@/lib/site-settings";

export default async function robots() {
  if (process.env.VERCEL_ENV === "preview") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const settings = await getSiteSettings();
  const siteUrl = resolveCanonicalSiteUrl(settings.siteUrl);
  const disallow = [
    "/dashboard",
    "/studio",
    "/api/",
    "/sign-in",
    "/sign-up",
  ];

  if (settings.accountDisabledPath) {
    disallow.push(settings.accountDisabledPath);
  }

  let host;
  try {
    host = new URL(siteUrl).host;
  } catch {
    host = undefined;
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host,
  };
}
