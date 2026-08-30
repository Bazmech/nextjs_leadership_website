import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Sanity on-demand revalidation.
 *
 * Accepts the shared secret as `?secret=`, JSON body `{ secret }`, or
 * `x-sanity-webhook-secret`.
 */
export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const expected = process.env.SANITY_WEBHOOK_SECRET;
  const { searchParams } = new URL(request.url);
  const provided =
    request.headers.get("x-sanity-webhook-secret") ||
    searchParams.get("secret") ||
    (typeof body.secret === "string" ? body.secret : "") ||
    "";

  if (expected && provided !== expected) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("sanity", "max");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
