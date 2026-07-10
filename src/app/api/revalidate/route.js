import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request) {
  const secret = request.headers.get("x-prismic-webhook-secret");

  if (
    process.env.PRISMIC_WEBHOOK_SECRET &&
    secret !== process.env.PRISMIC_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("prismic");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
