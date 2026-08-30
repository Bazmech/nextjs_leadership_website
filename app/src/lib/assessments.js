import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  assessmentAttributes,
  assessmentDomains,
  assessmentOverallAverages,
  assessments,
  assessmentStatements,
  assessmentSubmissions,
} from "@/db/schema";
import {
  averageStoredAverages,
  hasStoredAverages,
  orderAveragesByTree,
  resolveAttributeAverages,
  resolveDomainAverages,
  serializeScoreAverages,
} from "@/lib/assessment-scores";
import { getDb } from "@/lib/db";
import {
  isStaffRole,
  requireEnabledAppUser,
  requireSuperAdminAppUser,
} from "@/lib/users";
import {
  assessmentQueryIdSchema,
  isAssessmentStructureLocked,
} from "@/lib/schemas/assessment";

export { isAssessmentStructureLocked };

const FREQUENCY_MS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
  yearly: 365 * 24 * 60 * 60 * 1000,
};

export function formatFrequencyLabel(frequency) {
  const labels = {
    daily: "Every day",
    weekly: "Every week",
    monthly: "Every month",
    yearly: "Every year",
  };
  return labels[frequency] ?? frequency;
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((current - start) / (24 * 60 * 60 * 1000)) + 1;
}

/** ISO week number (1–53). */
function isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Thursday in current week decides the year.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / (24 * 60 * 60 * 1000) + 1) / 7);
}

/**
 * Default submission title from assessment name + start frequency.
 * daily → "{Name} {Year} {dayOfYear}"
 * weekly → "{Name} {Year} week {weekNumber}"
 * monthly → "{Name} {Year} {MonthName}"
 * yearly → "{Name} {Year}"
 */
export function buildDefaultSubmissionTitle(
  assessmentName,
  frequency,
  date = new Date(),
) {
  const name = String(assessmentName ?? "").trim() || "Assessment";
  const year = date.getFullYear();

  switch (frequency) {
    case "daily":
      return `${name} ${year} Day ${dayOfYear(date)}`;
    case "weekly":
      return `${name} ${year} week ${isoWeekNumber(date)}`;
    case "monthly":
      return `${name} ${year} ${date.toLocaleString("en-US", { month: "long" })}`;
    case "yearly":
    default:
      return `${name} ${year}`;
  }
}

export function formatStatusLabel(status) {
  const labels = {
    draft: "Draft",
    available: "Available",
    archived: "Archived",
  };
  return labels[status] ?? status;
}

export function parseAssessmentQueryId(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = assessmentQueryIdSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

const STRUCTURE_LOCKED_ERROR =
  "This assessment is available and can no longer be edited. Domains, attributes, and statements are locked.";

const DRAFT_REVERT_ERROR =
  "Once an assessment is available, it cannot be set back to draft.";

function nextSortOrder(rows) {
  if (!rows.length) return 0;
  return Math.max(...rows.map((row) => row.sortOrder ?? 0)) + 1;
}

async function getAssessmentStatus(assessmentId) {
  const db = getDb();
  const [row] = await db
    .select({ status: assessments.status })
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  return row?.status ?? null;
}

async function assertStructureEditable(assessmentId) {
  const status = await getAssessmentStatus(assessmentId);
  if (!status) return { ok: false, error: "Assessment not found." };
  if (isAssessmentStructureLocked(status)) {
    return { ok: false, error: STRUCTURE_LOCKED_ERROR };
  }
  return { ok: true };
}

/** Load assessment tree: domains → attributes → statements. */
export async function getAssessmentTree(assessmentId) {
  const db = getDb();

  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  if (!assessment) return null;

  const domains = await db
    .select()
    .from(assessmentDomains)
    .where(eq(assessmentDomains.assessmentId, assessmentId))
    .orderBy(asc(assessmentDomains.sortOrder), asc(assessmentDomains.createdAt));

  if (!domains.length) {
    return { ...assessment, domains: [] };
  }

  const domainIds = domains.map((d) => d.id);
  const attributes = await db
    .select()
    .from(assessmentAttributes)
    .where(inArray(assessmentAttributes.domainId, domainIds))
    .orderBy(
      asc(assessmentAttributes.sortOrder),
      asc(assessmentAttributes.createdAt),
    );

  const attributeIds = attributes.map((a) => a.id);
  const statements = attributeIds.length
    ? await db
        .select()
        .from(assessmentStatements)
        .where(inArray(assessmentStatements.attributeId, attributeIds))
        .orderBy(
          asc(assessmentStatements.sortOrder),
          asc(assessmentStatements.createdAt),
        )
    : [];

  const statementsByAttribute = new Map();
  for (const statement of statements) {
    const list = statementsByAttribute.get(statement.attributeId) ?? [];
    list.push(statement);
    statementsByAttribute.set(statement.attributeId, list);
  }

  const attributesByDomain = new Map();
  for (const attribute of attributes) {
    const list = attributesByDomain.get(attribute.domainId) ?? [];
    list.push({
      ...attribute,
      statements: statementsByAttribute.get(attribute.id) ?? [],
    });
    attributesByDomain.set(attribute.domainId, list);
  }

  return {
    ...assessment,
    domains: domains.map((domain) => ({
      ...domain,
      attributes: attributesByDomain.get(domain.id) ?? [],
    })),
  };
}

export function countStatementsInTree(tree) {
  if (!tree?.domains) return 0;
  let count = 0;
  for (const domain of tree.domains) {
    for (const attribute of domain.attributes ?? []) {
      count += attribute.statements?.length ?? 0;
    }
  }
  return count;
}

export function listStatementIds(tree) {
  const ids = [];
  for (const domain of tree?.domains ?? []) {
    for (const attribute of domain.attributes ?? []) {
      for (const statement of attribute.statements ?? []) {
        ids.push(statement.id);
      }
    }
  }
  return ids;
}

/** Super-admin: list all assessment templates. */
export async function listAllAssessments() {
  await requireSuperAdminAppUser();
  const db = getDb();
  return db
    .select()
    .from(assessments)
    .orderBy(desc(assessments.updatedAt));
}

/** Super-admin: create template. */
export async function createAssessmentTemplate({
  title,
  description,
  frequency,
  status,
}) {
  const appUser = await requireSuperAdminAppUser();
  const db = getDb();
  const [row] = await db
    .insert(assessments)
    .values({
      title,
      description,
      frequency,
      status,
      createdByClerkUserId: appUser.clerkUserId,
      updatedAt: new Date(),
    })
    .returning();
  return row;
}

/** Super-admin: update template meta. */
export async function updateAssessmentTemplate({
  assessmentId,
  title,
  description,
  frequency,
  status,
}) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [existing] = await db
    .select({ status: assessments.status })
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  if (!existing) return { ok: false, error: "Assessment not found." };

  if (existing.status !== "draft" && status === "draft") {
    return { ok: false, error: DRAFT_REVERT_ERROR };
  }

  const [row] = await db
    .update(assessments)
    .set({
      title,
      description,
      frequency,
      status,
      updatedAt: new Date(),
    })
    .where(eq(assessments.id, assessmentId))
    .returning();

  return { ok: true, assessment: row };
}

export async function touchAssessment(assessmentId) {
  const db = getDb();
  await db
    .update(assessments)
    .set({ updatedAt: new Date() })
    .where(eq(assessments.id, assessmentId));
}

export async function createDomain({ assessmentId, name }) {
  await requireSuperAdminAppUser();
  const editable = await assertStructureEditable(assessmentId);
  if (!editable.ok) return editable;

  const db = getDb();

  const siblings = await db
    .select({ sortOrder: assessmentDomains.sortOrder })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.assessmentId, assessmentId));

  const [row] = await db
    .insert(assessmentDomains)
    .values({
      assessmentId,
      name,
      sortOrder: nextSortOrder(siblings),
    })
    .returning();

  await touchAssessment(assessmentId);
  return { ok: true, domain: row };
}

export async function updateDomain({ domainId, name }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [existing] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, domainId))
    .limit(1);
  if (!existing) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(existing.assessmentId);
  if (!editable.ok) return editable;

  const [row] = await db
    .update(assessmentDomains)
    .set({ name })
    .where(eq(assessmentDomains.id, domainId))
    .returning();
  if (!row) return { ok: false, error: "Domain not found." };
  await touchAssessment(row.assessmentId);
  return { ok: true, domain: row };
}

export async function deleteDomain({ domainId }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [existing] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, domainId))
    .limit(1);
  if (!existing) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(existing.assessmentId);
  if (!editable.ok) return editable;

  const [row] = await db
    .delete(assessmentDomains)
    .where(eq(assessmentDomains.id, domainId))
    .returning();
  if (!row) return { ok: false, error: "Domain not found." };
  await touchAssessment(row.assessmentId);
  return { ok: true, assessmentId: row.assessmentId };
}

export async function createAttribute({ domainId, name }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [domain] = await db
    .select()
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, domainId))
    .limit(1);
  if (!domain) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(domain.assessmentId);
  if (!editable.ok) return editable;

  const siblings = await db
    .select({ sortOrder: assessmentAttributes.sortOrder })
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.domainId, domainId));

  const [row] = await db
    .insert(assessmentAttributes)
    .values({
      domainId,
      name,
      sortOrder: nextSortOrder(siblings),
    })
    .returning();

  await touchAssessment(domain.assessmentId);
  return { ok: true, attribute: row, assessmentId: domain.assessmentId };
}

export async function updateAttribute({ attributeId, name }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [existing] = await db
    .select()
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.id, attributeId))
    .limit(1);
  if (!existing) return { ok: false, error: "Attribute not found." };

  const [domain] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, existing.domainId))
    .limit(1);
  if (!domain) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(domain.assessmentId);
  if (!editable.ok) return editable;

  const [row] = await db
    .update(assessmentAttributes)
    .set({ name })
    .where(eq(assessmentAttributes.id, attributeId))
    .returning();
  if (!row) return { ok: false, error: "Attribute not found." };

  await touchAssessment(domain.assessmentId);

  return {
    ok: true,
    attribute: row,
    assessmentId: domain.assessmentId,
  };
}

export async function deleteAttribute({ attributeId }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [existing] = await db
    .select()
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.id, attributeId))
    .limit(1);
  if (!existing) return { ok: false, error: "Attribute not found." };

  const [domain] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, existing.domainId))
    .limit(1);
  if (!domain) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(domain.assessmentId);
  if (!editable.ok) return editable;

  await db
    .delete(assessmentAttributes)
    .where(eq(assessmentAttributes.id, attributeId));

  await touchAssessment(domain.assessmentId);
  return { ok: true, assessmentId: domain.assessmentId };
}

export async function createStatement({ attributeId, text }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [attribute] = await db
    .select()
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.id, attributeId))
    .limit(1);
  if (!attribute) return { ok: false, error: "Attribute not found." };

  const [domain] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, attribute.domainId))
    .limit(1);
  if (!domain) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(domain.assessmentId);
  if (!editable.ok) return editable;

  const siblings = await db
    .select({ sortOrder: assessmentStatements.sortOrder })
    .from(assessmentStatements)
    .where(eq(assessmentStatements.attributeId, attributeId));

  const [row] = await db
    .insert(assessmentStatements)
    .values({
      attributeId,
      text,
      sortOrder: nextSortOrder(siblings),
    })
    .returning();

  await touchAssessment(domain.assessmentId);

  return {
    ok: true,
    statement: row,
    assessmentId: domain.assessmentId,
  };
}

export async function updateStatement({ statementId, text }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [existing] = await db
    .select()
    .from(assessmentStatements)
    .where(eq(assessmentStatements.id, statementId))
    .limit(1);
  if (!existing) return { ok: false, error: "Statement not found." };

  const [attribute] = await db
    .select({ domainId: assessmentAttributes.domainId })
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.id, existing.attributeId))
    .limit(1);
  if (!attribute) return { ok: false, error: "Attribute not found." };

  const [domain] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, attribute.domainId))
    .limit(1);
  if (!domain) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(domain.assessmentId);
  if (!editable.ok) return editable;

  const [row] = await db
    .update(assessmentStatements)
    .set({ text })
    .where(eq(assessmentStatements.id, statementId))
    .returning();
  if (!row) return { ok: false, error: "Statement not found." };

  await touchAssessment(domain.assessmentId);
  return {
    ok: true,
    statement: row,
    assessmentId: domain.assessmentId,
  };
}

export async function deleteStatement({ statementId }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [existing] = await db
    .select()
    .from(assessmentStatements)
    .where(eq(assessmentStatements.id, statementId))
    .limit(1);
  if (!existing) return { ok: false, error: "Statement not found." };

  const [attribute] = await db
    .select({ domainId: assessmentAttributes.domainId })
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.id, existing.attributeId))
    .limit(1);
  if (!attribute) return { ok: false, error: "Attribute not found." };

  const [domain] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, attribute.domainId))
    .limit(1);
  if (!domain) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(domain.assessmentId);
  if (!editable.ok) return editable;

  await db
    .delete(assessmentStatements)
    .where(eq(assessmentStatements.id, statementId));

  await touchAssessment(domain.assessmentId);
  return { ok: true, assessmentId: domain.assessmentId };
}

async function swapSortOrder(rows, id, direction) {
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) return { ok: false, error: "Item not found." };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= rows.length) {
    return { ok: false, error: "Already at the edge." };
  }

  const reordered = [...rows];
  const [item] = reordered.splice(index, 1);
  reordered.splice(swapIndex, 0, item);

  return { ok: true, reordered };
}

async function applySortOrders(table, idColumn, reordered) {
  const db = getDb();
  for (let i = 0; i < reordered.length; i += 1) {
    if (reordered[i].sortOrder === i) continue;
    await db
      .update(table)
      .set({ sortOrder: i })
      .where(eq(idColumn, reordered[i].id));
  }
}

export async function moveDomain({ domainId, direction }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [existing] = await db
    .select()
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, domainId))
    .limit(1);
  if (!existing) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(existing.assessmentId);
  if (!editable.ok) return editable;

  const siblings = await db
    .select({
      id: assessmentDomains.id,
      sortOrder: assessmentDomains.sortOrder,
    })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.assessmentId, existing.assessmentId))
    .orderBy(asc(assessmentDomains.sortOrder), asc(assessmentDomains.createdAt));

  const swap = await swapSortOrder(siblings, domainId, direction);
  if (!swap.ok) return swap;

  await applySortOrders(assessmentDomains, assessmentDomains.id, swap.reordered);
  await touchAssessment(existing.assessmentId);
  return { ok: true, assessmentId: existing.assessmentId };
}

export async function moveAttribute({ attributeId, direction }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [existing] = await db
    .select()
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.id, attributeId))
    .limit(1);
  if (!existing) return { ok: false, error: "Attribute not found." };

  const [domain] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, existing.domainId))
    .limit(1);
  if (!domain) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(domain.assessmentId);
  if (!editable.ok) return editable;

  const siblings = await db
    .select({
      id: assessmentAttributes.id,
      sortOrder: assessmentAttributes.sortOrder,
    })
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.domainId, existing.domainId))
    .orderBy(
      asc(assessmentAttributes.sortOrder),
      asc(assessmentAttributes.createdAt),
    );

  const swap = await swapSortOrder(siblings, attributeId, direction);
  if (!swap.ok) return swap;

  await applySortOrders(
    assessmentAttributes,
    assessmentAttributes.id,
    swap.reordered,
  );
  await touchAssessment(domain.assessmentId);
  return { ok: true, assessmentId: domain.assessmentId };
}

export async function moveStatement({ statementId, direction }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [existing] = await db
    .select()
    .from(assessmentStatements)
    .where(eq(assessmentStatements.id, statementId))
    .limit(1);
  if (!existing) return { ok: false, error: "Statement not found." };

  const [attribute] = await db
    .select({ domainId: assessmentAttributes.domainId })
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.id, existing.attributeId))
    .limit(1);
  if (!attribute) return { ok: false, error: "Attribute not found." };

  const [domain] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, attribute.domainId))
    .limit(1);
  if (!domain) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(domain.assessmentId);
  if (!editable.ok) return editable;

  const siblings = await db
    .select({
      id: assessmentStatements.id,
      sortOrder: assessmentStatements.sortOrder,
    })
    .from(assessmentStatements)
    .where(eq(assessmentStatements.attributeId, existing.attributeId))
    .orderBy(
      asc(assessmentStatements.sortOrder),
      asc(assessmentStatements.createdAt),
    );

  const swap = await swapSortOrder(siblings, statementId, direction);
  if (!swap.ok) return swap;

  await applySortOrders(
    assessmentStatements,
    assessmentStatements.id,
    swap.reordered,
  );
  await touchAssessment(domain.assessmentId);
  return { ok: true, assessmentId: domain.assessmentId };
}

function sameIdSet(expectedIds, orderedIds) {
  if (expectedIds.length !== orderedIds.length) return false;
  const expected = new Set(expectedIds);
  return orderedIds.every((id) => expected.has(id));
}

export async function setDomainOrder({ assessmentId, orderedIds }) {
  await requireSuperAdminAppUser();
  const editable = await assertStructureEditable(assessmentId);
  if (!editable.ok) return editable;

  const db = getDb();
  const siblings = await db
    .select({
      id: assessmentDomains.id,
      sortOrder: assessmentDomains.sortOrder,
    })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.assessmentId, assessmentId))
    .orderBy(asc(assessmentDomains.sortOrder), asc(assessmentDomains.createdAt));

  if (!sameIdSet(siblings.map((row) => row.id), orderedIds)) {
    return { ok: false, error: "Domain order is out of date. Refresh and try again." };
  }

  const byId = new Map(siblings.map((row) => [row.id, row]));
  const reordered = orderedIds.map((id) => byId.get(id));
  await applySortOrders(assessmentDomains, assessmentDomains.id, reordered);
  await touchAssessment(assessmentId);
  return { ok: true, assessmentId };
}

export async function setAttributeOrder({ domainId, orderedIds }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [domain] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, domainId))
    .limit(1);
  if (!domain) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(domain.assessmentId);
  if (!editable.ok) return editable;

  const siblings = await db
    .select({
      id: assessmentAttributes.id,
      sortOrder: assessmentAttributes.sortOrder,
    })
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.domainId, domainId))
    .orderBy(
      asc(assessmentAttributes.sortOrder),
      asc(assessmentAttributes.createdAt),
    );

  if (!sameIdSet(siblings.map((row) => row.id), orderedIds)) {
    return {
      ok: false,
      error: "Attribute order is out of date. Refresh and try again.",
    };
  }

  const byId = new Map(siblings.map((row) => [row.id, row]));
  const reordered = orderedIds.map((id) => byId.get(id));
  await applySortOrders(
    assessmentAttributes,
    assessmentAttributes.id,
    reordered,
  );
  await touchAssessment(domain.assessmentId);
  return { ok: true, assessmentId: domain.assessmentId };
}

export async function setStatementOrder({ attributeId, orderedIds }) {
  await requireSuperAdminAppUser();
  const db = getDb();

  const [attribute] = await db
    .select({ domainId: assessmentAttributes.domainId })
    .from(assessmentAttributes)
    .where(eq(assessmentAttributes.id, attributeId))
    .limit(1);
  if (!attribute) return { ok: false, error: "Attribute not found." };

  const [domain] = await db
    .select({ assessmentId: assessmentDomains.assessmentId })
    .from(assessmentDomains)
    .where(eq(assessmentDomains.id, attribute.domainId))
    .limit(1);
  if (!domain) return { ok: false, error: "Domain not found." };

  const editable = await assertStructureEditable(domain.assessmentId);
  if (!editable.ok) return editable;

  const siblings = await db
    .select({
      id: assessmentStatements.id,
      sortOrder: assessmentStatements.sortOrder,
    })
    .from(assessmentStatements)
    .where(eq(assessmentStatements.attributeId, attributeId))
    .orderBy(
      asc(assessmentStatements.sortOrder),
      asc(assessmentStatements.createdAt),
    );

  if (!sameIdSet(siblings.map((row) => row.id), orderedIds)) {
    return {
      ok: false,
      error: "Statement order is out of date. Refresh and try again.",
    };
  }

  const byId = new Map(siblings.map((row) => [row.id, row]));
  const reordered = orderedIds.map((id) => byId.get(id));
  await applySortOrders(
    assessmentStatements,
    assessmentStatements.id,
    reordered,
  );
  await touchAssessment(domain.assessmentId);
  return { ok: true, assessmentId: domain.assessmentId };
}

/**
 * User-facing: assessments they can start or resume, plus eligibility.
 * Draft → staff only; Available → everyone; Archived → not startable.
 */
export async function listAssessmentsForUser() {
  const appUser = await requireEnabledAppUser();
  const db = getDb();
  const staff = isStaffRole(appUser.roleName);

  const all = await db
    .select()
    .from(assessments)
    .orderBy(desc(assessments.updatedAt));

  const submissions = await db
    .select()
    .from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.clerkUserId, appUser.clerkUserId))
    .orderBy(desc(assessmentSubmissions.startedAt));

  const submissionsByAssessment = new Map();
  for (const submission of submissions) {
    const list = submissionsByAssessment.get(submission.assessmentId) ?? [];
    list.push(submission);
    submissionsByAssessment.set(submission.assessmentId, list);
  }

  const startable = [];
  for (const assessment of all) {
    const userSubs = submissionsByAssessment.get(assessment.id) ?? [];
    const inProgress = userSubs.find((s) => s.status === "in_progress");

    if (assessment.status === "draft") {
      if (!staff) continue;
      startable.push({
        assessment,
        canStart: true,
        inProgress,
        nextAvailableAt: null,
        reason: null,
      });
      continue;
    }

    if (assessment.status === "available") {
      const gate = getFrequencyGate(assessment, userSubs);
      startable.push({
        assessment,
        canStart: gate.canStart || Boolean(inProgress),
        inProgress,
        nextAvailableAt: gate.nextAvailableAt,
        reason: inProgress
          ? null
          : gate.canStart
            ? null
            : gate.reason,
      });
      continue;
    }

    // archived — not startable; past list covers history
  }

  return {
    startable,
    past: submissions.map((submission) => {
      const assessment = all.find((a) => a.id === submission.assessmentId);
      return { submission, assessment: assessment ?? null };
    }),
  };
}

function getFrequencyGate(assessment, userSubs) {
  const windowMs = FREQUENCY_MS[assessment.frequency];
  if (!windowMs) {
    return { canStart: true, nextAvailableAt: null, reason: null };
  }

  // Frequency limits new starts after the most recent start (any status).
  const latest = userSubs[0];
  if (!latest) {
    return { canStart: true, nextAvailableAt: null, reason: null };
  }

  const startedAt = new Date(latest.startedAt).getTime();
  const nextAt = startedAt + windowMs;
  if (Date.now() >= nextAt) {
    return { canStart: true, nextAvailableAt: null, reason: null };
  }

  return {
    canStart: false,
    nextAvailableAt: new Date(nextAt),
    reason: `You can start another ${formatFrequencyLabel(assessment.frequency).toLowerCase()}.`,
  };
}

export async function startSubmission({ assessmentId, title }) {
  const appUser = await requireEnabledAppUser();
  const db = getDb();
  const staff = isStaffRole(appUser.roleName);

  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  if (!assessment) {
    return { ok: false, error: "Assessment not found." };
  }

  if (assessment.status === "archived") {
    return {
      ok: false,
      error: "This assessment is archived. You can view past submissions only.",
    };
  }

  if (assessment.status === "draft" && !staff) {
    return { ok: false, error: "This assessment is not available." };
  }

  const existing = await db
    .select()
    .from(assessmentSubmissions)
    .where(
      and(
        eq(assessmentSubmissions.assessmentId, assessmentId),
        eq(assessmentSubmissions.clerkUserId, appUser.clerkUserId),
      ),
    )
    .orderBy(desc(assessmentSubmissions.startedAt));

  const inProgress = existing.find((s) => s.status === "in_progress");
  if (inProgress) {
    return { ok: true, submission: inProgress, resumed: true };
  }

  if (assessment.status === "available") {
    const gate = getFrequencyGate(assessment, existing);
    if (!gate.canStart) {
      return { ok: false, error: gate.reason };
    }
  }

  const tree = await getAssessmentTree(assessmentId);
  if (!countStatementsInTree(tree)) {
    return {
      ok: false,
      error: "This assessment has no statements yet.",
    };
  }

  const [row] = await db
    .insert(assessmentSubmissions)
    .values({
      assessmentId,
      clerkUserId: appUser.clerkUserId,
      title,
      status: "in_progress",
      answers: {},
      startedAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return { ok: true, submission: row, resumed: false };
}

/**
 * Load a submission for the owner (or staff viewing own).
 * Returns tree + answers for display.
 */
export async function getOwnedSubmission(submissionId) {
  const appUser = await requireEnabledAppUser();
  const db = getDb();

  const [submission] = await db
    .select()
    .from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, submissionId))
    .limit(1);

  if (!submission) return null;
  if (submission.clerkUserId !== appUser.clerkUserId) {
    return null;
  }

  const tree = await getAssessmentTree(submission.assessmentId);
  if (!tree) return null;

  // Archived templates: still allow viewing own past submissions.
  if (tree.status === "draft" && !isStaffRole(appUser.roleName)) {
    return null;
  }

  return { submission, assessment: tree };
}

/**
 * Rename own submission — allowed in progress or completed.
 * See user-data-authorization.mdc.
 */
export async function renameOwnedSubmission({ submissionId, title }) {
  const appUser = await requireEnabledAppUser();
  const db = getDb();

  const [submission] = await db
    .select()
    .from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, submissionId))
    .limit(1);

  if (!submission || submission.clerkUserId !== appUser.clerkUserId) {
    return { ok: false, error: "Submission not found." };
  }

  const [row] = await db
    .update(assessmentSubmissions)
    .set({
      title,
      updatedAt: new Date(),
    })
    .where(eq(assessmentSubmissions.id, submissionId))
    .returning();

  return { ok: true, submission: row };
}

/**
 * Toggle whether own completed submission is included in the overall average.
 * Recalculates and stores overall domain and attribute averages for the template.
 * See user-data-authorization.mdc.
 */
export async function setOwnedSubmissionIncludeInAverage({
  submissionId,
  includeInAverage,
}) {
  const appUser = await requireEnabledAppUser();
  const db = getDb();

  const [submission] = await db
    .select()
    .from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, submissionId))
    .limit(1);

  if (!submission || submission.clerkUserId !== appUser.clerkUserId) {
    return { ok: false, error: "Submission not found." };
  }

  if (includeInAverage && submission.status !== "completed") {
    return {
      ok: false,
      error: "Only completed assessments can be included in the overall average.",
    };
  }

  const stored = await ensureSubmissionAverages(submission);
  const [row] = await db
    .update(assessmentSubmissions)
    .set({
      includeInAverage,
      domainAverages: stored.domainAverages,
      attributeAverages: stored.attributeAverages,
      updatedAt: new Date(),
    })
    .where(eq(assessmentSubmissions.id, submissionId))
    .returning();

  await refreshOverallAveragesForAssessment(submission.assessmentId);
  return { ok: true, submission: row };
}

async function ensureSubmissionAverages(submission) {
  const hasDomains =
    Array.isArray(submission.domainAverages) &&
    submission.domainAverages.length > 0;
  const hasAttributes =
    Array.isArray(submission.attributeAverages) &&
    submission.attributeAverages.length > 0;
  if (hasDomains && hasAttributes) {
    return {
      domainAverages: submission.domainAverages,
      attributeAverages: submission.attributeAverages,
    };
  }

  const tree = await getAssessmentTree(submission.assessmentId);
  return serializeScoreAverages(tree, submission.answers ?? {});
}

function orderStoredAverages(tree, domainAverages, attributeAverages) {
  const domainIds = (tree?.domains ?? []).map((domain) => domain.id);
  const attributeIds = (tree?.domains ?? []).flatMap((domain) =>
    (domain.attributes ?? []).map((attribute) => attribute.id),
  );
  return {
    domainAverages: orderAveragesByTree(domainAverages, domainIds),
    attributeAverages: orderAveragesByTree(attributeAverages, attributeIds),
  };
}

/**
 * Recalculate stored overall domain and attribute averages from opted-in
 * completed submissions for one template. Aggregate scores only — no identities.
 */
async function refreshOverallAveragesForAssessment(assessmentId) {
  const db = getDb();
  const submissions = await db
    .select({
      domainAverages: assessmentSubmissions.domainAverages,
      attributeAverages: assessmentSubmissions.attributeAverages,
      answers: assessmentSubmissions.answers,
    })
    .from(assessmentSubmissions)
    .where(
      and(
        eq(assessmentSubmissions.assessmentId, assessmentId),
        eq(assessmentSubmissions.status, "completed"),
        eq(assessmentSubmissions.includeInAverage, true),
      ),
    );

  if (submissions.length === 0) {
    await db
      .delete(assessmentOverallAverages)
      .where(eq(assessmentOverallAverages.assessmentId, assessmentId));
    return;
  }

  const tree = await getAssessmentTree(assessmentId);
  const domainLists = [];
  const attributeLists = [];
  for (const submission of submissions) {
    const computed = serializeScoreAverages(tree, submission.answers ?? {});
    domainLists.push(
      Array.isArray(submission.domainAverages) &&
        submission.domainAverages.length
        ? submission.domainAverages
        : computed.domainAverages,
    );
    attributeLists.push(
      Array.isArray(submission.attributeAverages) &&
        submission.attributeAverages.length
        ? submission.attributeAverages
        : computed.attributeAverages,
    );
  }

  const ordered = orderStoredAverages(
    tree,
    averageStoredAverages(domainLists),
    averageStoredAverages(attributeLists),
  );

  await db
    .insert(assessmentOverallAverages)
    .values({
      assessmentId,
      domainAverages: ordered.domainAverages,
      attributeAverages: ordered.attributeAverages,
      submissionCount: submissions.length,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: assessmentOverallAverages.assessmentId,
      set: {
        domainAverages: ordered.domainAverages,
        attributeAverages: ordered.attributeAverages,
        submissionCount: submissions.length,
        updatedAt: new Date(),
      },
    });
}

async function ensureOverallAveragesCached() {
  const db = getDb();
  const optedIn = await db
    .selectDistinct({ assessmentId: assessmentSubmissions.assessmentId })
    .from(assessmentSubmissions)
    .where(
      and(
        eq(assessmentSubmissions.status, "completed"),
        eq(assessmentSubmissions.includeInAverage, true),
      ),
    );
  if (optedIn.length === 0) return;

  const cached = await db
    .select({ assessmentId: assessmentOverallAverages.assessmentId })
    .from(assessmentOverallAverages);
  const cachedIds = new Set(cached.map((row) => row.assessmentId));

  for (const row of optedIn) {
    if (!cachedIds.has(row.assessmentId)) {
      await refreshOverallAveragesForAssessment(row.assessmentId);
    }
  }
}

/**
 * Overall assessment average across all users, grouped by template.
 * Reads stored domain and attribute averages (from opted-in completed
 * submissions). Never returns identities, titles, or row ids.
 * Dashboard-gated via requireEnabledAppUser.
 * See user-data-authorization.mdc (aggregate statistic, not per-user records).
 */
export async function getOverallAssessmentAverages(assessmentId) {
  await requireEnabledAppUser();
  await ensureOverallAveragesCached();
  const db = getDb();

  const rows = assessmentId
    ? await db
        .select()
        .from(assessmentOverallAverages)
        .where(eq(assessmentOverallAverages.assessmentId, assessmentId))
    : await db.select().from(assessmentOverallAverages);
  const groups = [];
  for (const row of rows) {
    const tree = await getAssessmentTree(row.assessmentId);
    if (!tree) continue;
    const ordered = orderStoredAverages(
      tree,
      row.domainAverages ?? [],
      row.attributeAverages ?? [],
    );
    groups.push({
      assessment: tree,
      submissionCount: row.submissionCount,
      domainAverages: ordered.domainAverages,
      attributeAverages: ordered.attributeAverages,
    });
  }

  return groups;
}

/** Past list plus domain and attribute series for `/dashboard/assessments/past`. */
export async function getPastAssessmentsPageData(assessmentId) {
  const { startable, past } = await listAssessmentsForUser();
  const filtered = assessmentId
    ? past.filter(({ submission }) => submission.assessmentId === assessmentId)
    : past;
  const { domainSeries, attributeSeries } =
    await buildPastAverageSeries(filtered);

  let assessmentTitle = null;
  if (assessmentId) {
    assessmentTitle =
      filtered.find(({ assessment }) => assessment?.id === assessmentId)
        ?.assessment?.title ??
      startable.find(({ assessment }) => assessment.id === assessmentId)
        ?.assessment.title ??
      null;
  }

  return {
    past: filtered,
    domainSeries,
    attributeSeries,
    assessmentId: assessmentId ?? null,
    assessmentTitle,
  };
}

function sortCompletedPast(items) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.submission.completedAt ?? a.submission.startedAt);
    const bTime = new Date(b.submission.completedAt ?? b.submission.startedAt);
    return aTime - bTime;
  });
}

function buildSeriesPoints(sortedItems, resolveItems) {
  const itemMeta = new Map();
  const points = sortedItems.map(({ submission, assessment }) => {
    const items = resolveItems(submission);
    for (const item of items) {
      itemMeta.set(item.id, {
        id: item.id,
        name: item.domainName ? `${item.name} (${item.domainName})` : item.name,
      });
    }
    const scores = {};
    for (const item of items) {
      scores[item.id] = item.average;
    }
    return {
      id: submission.id,
      title: submission.title,
      completedAt: submission.completedAt,
      assessmentTitle: assessment?.title ?? "",
      ...scores,
    };
  });
  return {
    assessment: sortedItems[0]?.assessment ?? null,
    items: [...itemMeta.values()],
    points,
  };
}

/** Completed submissions for the past-assessments line charts. */
async function buildPastAverageSeries(past) {
  const completed = past.filter(
    ({ submission }) => submission.status === "completed",
  );
  if (completed.length === 0) {
    return { domainSeries: [], attributeSeries: [] };
  }

  const missingTreeIds = [
    ...new Set(
      completed
        .filter(
          ({ submission }) =>
            !hasStoredAverages(submission.domainAverages) ||
            !hasStoredAverages(submission.attributeAverages),
        )
        .map(({ submission }) => submission.assessmentId),
    ),
  ];
  const trees = new Map();
  for (const assessmentId of missingTreeIds) {
    trees.set(assessmentId, await getAssessmentTree(assessmentId));
  }

  const byAssessment = new Map();
  for (const item of completed) {
    const list = byAssessment.get(item.submission.assessmentId) ?? [];
    list.push(item);
    byAssessment.set(item.submission.assessmentId, list);
  }

  const domainSeries = [];
  const attributeSeries = [];
  for (const [assessmentId, items] of byAssessment) {
    const sorted = sortCompletedPast(items);
    const tree = trees.get(assessmentId);
    const domainGroup = buildSeriesPoints(sorted, (submission) =>
      resolveDomainAverages(
        tree,
        submission.answers ?? {},
        submission.domainAverages,
      ),
    );
    const attributeGroup = buildSeriesPoints(sorted, (submission) =>
      resolveAttributeAverages(
        tree,
        submission.answers ?? {},
        submission.attributeAverages,
      ),
    );
    if (domainGroup.items.length > 0 && domainGroup.points.length > 0) {
      domainSeries.push(domainGroup);
    }
    if (attributeGroup.items.length > 0 && attributeGroup.points.length > 0) {
      attributeSeries.push(attributeGroup);
    }
  }

  return { domainSeries, attributeSeries };
}

export async function saveSubmissionAnswers({ submissionId, answers }) {
  const appUser = await requireEnabledAppUser();
  const db = getDb();

  const [submission] = await db
    .select()
    .from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, submissionId))
    .limit(1);

  if (!submission || submission.clerkUserId !== appUser.clerkUserId) {
    return { ok: false, error: "Submission not found." };
  }

  if (submission.status === "completed") {
    return { ok: false, error: "This assessment is already completed." };
  }

  const tree = await getAssessmentTree(submission.assessmentId);
  const validIds = new Set(listStatementIds(tree));
  const cleaned = {};
  for (const [statementId, score] of Object.entries(answers ?? {})) {
    if (!validIds.has(statementId)) continue;
    const n = Number(score);
    if (!Number.isInteger(n) || n < 1 || n > 5) continue;
    cleaned[statementId] = n;
  }

  const [row] = await db
    .update(assessmentSubmissions)
    .set({
      answers: cleaned,
      updatedAt: new Date(),
    })
    .where(eq(assessmentSubmissions.id, submissionId))
    .returning();

  return { ok: true, submission: row };
}

export async function completeSubmission({ submissionId, answers }) {
  const saveResult = await saveSubmissionAnswers({ submissionId, answers });
  if (!saveResult.ok) return saveResult;

  const owned = await getOwnedSubmission(submissionId);
  if (!owned) return { ok: false, error: "Submission not found." };

  const statementIds = listStatementIds(owned.assessment);
  const savedAnswers = saveResult.submission.answers ?? {};
  const unanswered = statementIds.filter((id) => savedAnswers[id] == null);

  if (unanswered.length > 0) {
    return {
      ok: false,
      error: `Please score all statements (${unanswered.length} remaining).`,
    };
  }

  const stored = serializeScoreAverages(owned.assessment, savedAnswers);
  const db = getDb();
  const [row] = await db
    .update(assessmentSubmissions)
    .set({
      status: "completed",
      completedAt: new Date(),
      updatedAt: new Date(),
      domainAverages: stored.domainAverages,
      attributeAverages: stored.attributeAverages,
    })
    .where(eq(assessmentSubmissions.id, submissionId))
    .returning();

  if (row.includeInAverage) {
    await refreshOverallAveragesForAssessment(row.assessmentId);
  }

  return { ok: true, submission: row };
}

/**
 * Delete own in-progress submission only — completed assessments are kept.
 * See user-data-authorization.mdc.
 */
export async function deleteOwnedSubmission({ submissionId }) {
  const appUser = await requireEnabledAppUser();
  const db = getDb();

  const [submission] = await db
    .select()
    .from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, submissionId))
    .limit(1);

  if (!submission || submission.clerkUserId !== appUser.clerkUserId) {
    return { ok: false, error: "Submission not found." };
  }

  if (submission.status === "completed") {
    return {
      ok: false,
      error: "Completed assessments cannot be deleted.",
    };
  }

  await db
    .delete(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, submissionId));

  return { ok: true };
}

/** One dashboard card per assessment template the user can see. */
export async function getDashboardAssessmentSummary() {
  const { startable, past } = await listAssessmentsForUser();
  const pastByAssessment = new Map();
  for (const item of past) {
    const id = item.submission.assessmentId;
    pastByAssessment.set(id, (pastByAssessment.get(id) ?? 0) + 1);
  }

  const cards = [];
  const seen = new Set();

  for (const { assessment, inProgress } of startable) {
    seen.add(assessment.id);
    cards.push({
      id: assessment.id,
      title: assessment.title,
      inProgress: Boolean(inProgress),
      showStart: true,
      startHref: inProgress
        ? `/dashboard/assessments/submissions/${inProgress.id}`
        : `/dashboard/assessments#assessment-${assessment.id}`,
      pastCount: pastByAssessment.get(assessment.id) ?? 0,
    });
  }

  for (const { submission, assessment } of past) {
    if (!assessment || seen.has(assessment.id)) continue;
    seen.add(assessment.id);
    cards.push({
      id: assessment.id,
      title: assessment.title,
      inProgress: false,
      showStart: false,
      startHref: null,
      pastCount: pastByAssessment.get(assessment.id) ?? 0,
    });
  }

  return { cards };
}
