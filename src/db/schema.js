import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

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

export const assessmentStatusEnum = pgEnum("assessment_status", [
  "draft",
  "available",
  "archived",
]);

export const assessmentFrequencyEnum = pgEnum("assessment_frequency", [
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "in_progress",
  "completed",
]);

/** Assessment template (super_admin managed). */
export const assessments = pgTable("assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: assessmentStatusEnum("status").default("draft").notNull(),
  frequency: assessmentFrequencyEnum("frequency").default("yearly").notNull(),
  createdByClerkUserId: text("created_by_clerk_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const assessmentDomains = pgTable("assessment_domains", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const assessmentAttributes = pgTable("assessment_attributes", {
  id: uuid("id").defaultRandom().primaryKey(),
  domainId: uuid("domain_id")
    .notNull()
    .references(() => assessmentDomains.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const assessmentStatements = pgTable("assessment_statements", {
  id: uuid("id").defaultRandom().primaryKey(),
  attributeId: uuid("attribute_id")
    .notNull()
    .references(() => assessmentAttributes.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * A user's filled assessment instance.
 * `answers` is JSONB: { [statementId]: score 1–5 }.
 */
export const assessmentSubmissions = pgTable("assessment_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "restrict" }),
  clerkUserId: text("clerk_user_id").notNull(),
  title: text("title").notNull(),
  status: submissionStatusEnum("status").default("in_progress").notNull(),
  answers: jsonb("answers").default({}).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
