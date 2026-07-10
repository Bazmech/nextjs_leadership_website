"use server";

import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { coachingInquiries } from "@/db/schema";
import { getDb } from "@/lib/db";

export async function submitInquiry(_prevState, formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all fields." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    const { userId } = await auth();
    const db = getDb();

    await db.insert(coachingInquiries).values({
      clerkUserId: userId ?? null,
      name,
      email,
      message,
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      error: null,
      message: "Thanks! We'll be in touch within one business day.",
    };
  } catch (error) {
    console.error("submitInquiry failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
    };
  }
}

export async function getRecentInquiries() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  try {
    const db = getDb();

    return db
      .select()
      .from(coachingInquiries)
      .where(eq(coachingInquiries.clerkUserId, userId))
      .orderBy(desc(coachingInquiries.createdAt))
      .limit(5);
  } catch (error) {
    console.error("getRecentInquiries failed:", error);
    return [];
  }
}
