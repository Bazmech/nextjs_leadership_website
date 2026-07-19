/** Public Cookiebot domain group ID (safe to expose in the client). */
export const COOKIEBOT_CBID = "9a3991c5-8aa9-4797-9dfd-dcc3b179b502";

const PRODUCTION_HOSTS = new Set([
  "www.productiveleadership.org",
  "productiveleadership.org",
]);

/**
 * Cookiebot should only run on the live production site — not local or preview.
 */
export function shouldLoadCookiebot() {
  if (process.env.VERCEL_ENV !== "production") {
    return false;
  }

  const productionHost = (
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    ""
  ).replace(/^https?:\/\//, "");

  if (!productionHost) {
    return true;
  }

  return PRODUCTION_HOSTS.has(productionHost);
}
