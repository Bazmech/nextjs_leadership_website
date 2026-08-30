import { auth } from "@clerk/nextjs/server";

/** True when the request has an active Clerk session. */
export async function isUserSignedIn() {
  const { userId } = await auth();
  return Boolean(userId);
}
