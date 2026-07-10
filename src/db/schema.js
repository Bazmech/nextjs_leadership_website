import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const coachingInquiries = pgTable("coaching_inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
