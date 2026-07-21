import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import {
  assessmentAttributes,
  assessmentDomains,
  assessments,
  assessmentStatements,
  assessmentSubmissions,
} from "@/db/schema";
import { getDb } from "@/lib/db";
import {
  getCurrentAppUser,
  isStaffRole,
  requireEnabledAppUser,
  requireSuperAdminAppUser,
} from "@/lib/users";
import { isAssessmentStructureLocked } from "@/lib/schemas/assessment";

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

export function formatStatusLabel(status) {
  const labels = {
    draft: "Draft",
    available: "Available",
    archived: "Archived",
  };
  return labels[status] ?? status;
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

  const db = getDb();
  const [row] = await db
    .update(assessmentSubmissions)
    .set({
      status: "completed",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(assessmentSubmissions.id, submissionId))
    .returning();

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

/** Dashboard card counts for current user. */
export async function getDashboardAssessmentSummary() {
  const appUser = await getCurrentAppUser();
  if (!appUser?.enabled) {
    return { pastCount: 0, canStartAny: false };
  }

  const db = getDb();
  const [pastRow] = await db
    .select({ value: count() })
    .from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.clerkUserId, appUser.clerkUserId));

  const staff = isStaffRole(appUser.roleName);
  const statuses = staff ? ["draft", "available"] : ["available"];

  const [availableRow] = await db
    .select({ value: count() })
    .from(assessments)
    .where(inArray(assessments.status, statuses));

  return {
    pastCount: Number(pastRow?.value ?? 0),
    canStartAny: Number(availableRow?.value ?? 0) > 0,
  };
}
