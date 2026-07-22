import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse } from "next/server";
import { deleteAppUserDataByClerkId } from "@/lib/users";

/**
 * Clerk webhook endpoint — currently handles `user.deleted` by removing
 * only that user's rows (assessment submissions + app users record).
 *
 * Configure in Clerk Dashboard → Webhooks:
 *   URL: https://your-domain.com/api/webhooks/clerk
 *   Events: user.deleted
 *   Env: CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
 */
export async function POST(request) {
  let evt;

  try {
    evt = await verifyWebhook(request);
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  if (evt.type === "user.deleted") {
    const clerkUserId = evt.data?.id;

    if (!clerkUserId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    try {
      await deleteAppUserDataByClerkId(clerkUserId);
    } catch (error) {
      console.error(
        `Failed to delete app data for Clerk user ${clerkUserId}:`,
        error,
      );
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
