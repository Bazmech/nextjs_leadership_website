import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  roleId: uuid("role_id")
    .notNull()
    .references(() => userRoles.id),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
