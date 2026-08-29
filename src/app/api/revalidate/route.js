import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Prismic on-demand revalidation.
 *
 * Prismic sends the webhook Secret in the JSON body (`secret`). A custom
 * header `x-prismic-webhook-secret` is also accepted so either setup works.
 */
export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const expected = process.env.PRISMIC_WEBHOOK_SECRET;
  const provided =
    request.headers.get("x-prismic-webhook-secret") ||
    (typeof body.secret === "string" ? body.secret : "") ||
    "";

  if (expected && provided !== expected) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("prismic", "max");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
