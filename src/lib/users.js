import { count, eq, inArray } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { assessmentSubmissions, userRoles, users } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getSiteSettings } from "@/lib/prismic-settings";

export const DEFAULT_ROLE_NAME = "default";
export const ACCOUNT_DISABLED_PATH_FALLBACK = "/account-disabled";
const STAFF_ROLE_NAMES = new Set(["admin", "super_admin"]);

/** Path of the CMS page selected in Settings → Account disabled page. */
export async function getAccountDisabledPath() {
  try {
    const settings = await getSiteSettings();
    return settings.accountDisabledPath || ACCOUNT_DISABLED_PATH_FALLBACK;
  } catch {
    return ACCOUNT_DISABLED_PATH_FALLBACK;
  }
}

async function getAccountDisabledPathOrFallback() {
  try {
    return await Promise.race([
      getAccountDisabledPath(),
      new Promise((resolve) => {
        setTimeout(() => resolve(ACCOUNT_DISABLED_PATH_FALLBACK), 2000);
      }),
    ]);
  } catch {
    return ACCOUNT_DISABLED_PATH_FALLBACK;
  }
}

/** Redirect disabled session users to the CMS account-disabled page. */
export async function redirectIfAppUserDisabled(appUser) {
  if (!appUser || appUser.enabled !== false) {
    return;
  }

  let path = await getAccountDisabledPathOrFallback();
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  // Never bounce disabled users back onto the dashboard (redirect loop).
  if (path === "/dashboard" || path.startsWith("/dashboard/")) {
    path = ACCOUNT_DISABLED_PATH_FALLBACK;
  }

  redirect(path);
}

function formatClerkDisplayName(clerkUser) {
  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || clerkUser.username || "Unnamed user";
}

function formatClerkEmail(clerkUser) {
  return (
    clerkUser.emailAddresses?.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ??
    clerkUser.emailAddresses?.[0]?.emailAddress ??
    null
  );
}

/**
 * Ensure a Clerk user exists in the local `users` table.
 * New users are assigned the seeded `default` role.
 */
export async function ensureAppUser(clerkUserId) {
  if (!clerkUserId) {
    return null;
  }

  const db = getDb();

  const [existing] = await db
    .select({
      id: users.id,
      clerkUserId: users.clerkUserId,
      roleId: users.roleId,
      enabled: users.enabled,
      createdAt: users.createdAt,
      roleName: userRoles.name,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.roleId, userRoles.id))
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [defaultRole] = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.name, DEFAULT_ROLE_NAME))
    .limit(1);

  if (!defaultRole) {
    throw new Error(
      `Missing "${DEFAULT_ROLE_NAME}" role in user_roles. Run migrations.`,
    );
  }

  const [inserted] = await db
    .insert(users)
    .values({
      clerkUserId,
      roleId: defaultRole.id,
      enabled: true,
    })
    .onConflictDoNothing({ target: users.clerkUserId })
    .returning();

  if (inserted) {
    return {
      ...inserted,
      roleName: DEFAULT_ROLE_NAME,
    };
  }

  return getAppUserByClerkId(clerkUserId);
}

export async function getAppUserByClerkId(clerkUserId) {
  if (!clerkUserId) {
    return null;
  }

  const db = getDb();

  const [row] = await db
    .select({
      id: users.id,
      clerkUserId: users.clerkUserId,
      roleId: users.roleId,
      enabled: users.enabled,
      createdAt: users.createdAt,
      roleName: userRoles.name,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.roleId, userRoles.id))
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return row ?? null;
}

/**
 * Delete only this Clerk user's app-owned rows (submissions + users row).
 * Does not delete assessment templates they may have created for others.
 * Idempotent — safe for Clerk webhook retries.
 */
export async function deleteAppUserDataByClerkId(clerkUserId) {
  if (!clerkUserId) {
    return { ok: false, error: "Missing Clerk user id." };
  }

  const db = getDb();

  await db
    .delete(assessmentSubmissions)
    .where(eq(assessmentSubmissions.clerkUserId, clerkUserId));

  await db.delete(users).where(eq(users.clerkUserId, clerkUserId));

  return { ok: true };
}

/**
 * Load the current session’s app user (cached per request).
 * Does not redirect — call `redirectIfAppUserDisabled` on protected surfaces.
 */
const loadCurrentAppUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  return ensureAppUser(userId);
});

/**
 * App user for the current Clerk session (includes `roleName`).
 * Ensures a local row exists. Does not redirect when disabled.
 */
export async function getCurrentAppUser() {
  return loadCurrentAppUser();
}

/**
 * Session user that must be enabled — redirects to the CMS disabled page otherwise.
 */
export async function requireEnabledAppUser() {
  const appUser = await getCurrentAppUser();
  await redirectIfAppUserDisabled(appUser);
  return appUser;
}

export function isStaffRole(roleName) {
  return STAFF_ROLE_NAMES.has(roleName);
}

export function isSuperAdminRole(roleName) {
  return roleName === "super_admin";
}

/** Admins may not edit or assign the `super_admin` role. */
export function canManageUser(actorRoleName, targetRoleName) {
  if (!isStaffRole(actorRoleName)) {
    return false;
  }

  if (actorRoleName === "admin" && targetRoleName === "super_admin") {
    return false;
  }

  return true;
}

export function canAssignRole(actorRoleName, roleName) {
  if (!isStaffRole(actorRoleName)) {
    return false;
  }

  if (actorRoleName === "admin" && roleName === "super_admin") {
    return false;
  }

  return true;
}

/**
 * Own-data access, or admin/super_admin on an explicit admin surface.
 * @param {{ roleName?: string | null, clerkUserId?: string | null }} actor
 * @param {string} targetClerkUserId
 * @param {{ allowStaff?: boolean }} [options] — set allowStaff only on admin pages/actions
 */
export function assertCanAccessUserData(
  actor,
  targetClerkUserId,
  { allowStaff = false } = {},
) {
  if (!actor?.clerkUserId || !targetClerkUserId) {
    return false;
  }

  if (actor.clerkUserId === targetClerkUserId) {
    return true;
  }

  return allowStaff && isStaffRole(actor.roleName);
}

/** Redirect non-staff callers away from admin user-management surfaces. */
export async function requireStaffAppUser() {
  const appUser = await requireEnabledAppUser();

  if (!isStaffRole(appUser?.roleName)) {
    redirect("/dashboard");
  }

  return appUser;
}

/** Redirect non-super-admin callers away from exclusive super_admin surfaces. */
export async function requireSuperAdminAppUser() {
  const appUser = await requireEnabledAppUser();

  if (!isSuperAdminRole(appUser?.roleName)) {
    redirect("/dashboard");
  }

  return appUser;
}

export async function getAppUserById(userId) {
  if (!userId) {
    return null;
  }

  const db = getDb();

  const [row] = await db
    .select({
      id: users.id,
      clerkUserId: users.clerkUserId,
      roleId: users.roleId,
      enabled: users.enabled,
      createdAt: users.createdAt,
      roleName: userRoles.name,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.roleId, userRoles.id))
    .where(eq(users.id, userId))
    .limit(1);

  return row ?? null;
}

async function getAppUsersByClerkIds(clerkUserIds) {
  if (!clerkUserIds.length) {
    return new Map();
  }

  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      clerkUserId: users.clerkUserId,
      roleId: users.roleId,
      enabled: users.enabled,
      createdAt: users.createdAt,
      roleName: userRoles.name,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.roleId, userRoles.id))
    .where(inArray(users.clerkUserId, clerkUserIds));

  return new Map(rows.map((row) => [row.clerkUserId, row]));
}

/**
 * Staff-only: totals of enabled (active) and disabled rows in `users`,
 * plus pending Clerk waitlist (waiting room) entries.
 * Cross-user admin surface — see user-data-authorization.mdc.
 */
export async function getUserAccessCounts() {
  const actor = await getCurrentAppUser();

  if (!isStaffRole(actor?.roleName)) {
    return { active: 0, disabled: 0, waitingRoom: 0 };
  }

  const db = getDb();
  const [rows, waitingRoom] = await Promise.all([
    db
      .select({
        enabled: users.enabled,
        total: count(),
      })
      .from(users)
      .groupBy(users.enabled),
    getClerkWaitingRoomCount(),
  ]);

  let active = 0;
  let disabled = 0;

  for (const row of rows) {
    const total = Number(row.total) || 0;
    if (row.enabled) {
      active = total;
    } else {
      disabled = total;
    }
  }

  return { active, disabled, waitingRoom };
}

/** Pending Clerk waitlist entries (waiting room). */
async function getClerkWaitingRoomCount() {
  try {
    const client = await clerkClient();
    const { totalCount } = await client.waitlistEntries.list({
      status: "pending",
      limit: 1,
    });
    return Number(totalCount) || 0;
  } catch (error) {
    console.error("Failed to load Clerk waiting room count:", error);
    return 0;
  }
}

const WAITLIST_PAGE_SIZE = 10;

/**
 * Staff-only: list pending Clerk waitlist entries with search + paging.
 * Cross-user admin surface — see user-data-authorization.mdc.
 */
export async function listWaitlistEntries({
  query = "",
  page = 1,
  pageSize = WAITLIST_PAGE_SIZE,
} = {}) {
  const actor = await getCurrentAppUser();

  if (!isStaffRole(actor?.roleName)) {
    return { entries: [], totalCount: 0, page: 1, pageSize, totalPages: 0 };
  }

  const safePageSize = Math.min(Math.max(Number(pageSize) || WAITLIST_PAGE_SIZE, 1), 50);
  const safePage = Math.max(Number(page) || 1, 1);
  const trimmed = query?.trim() ?? "";

  try {
    const client = await clerkClient();
    const { data, totalCount } = await client.waitlistEntries.list({
      status: "pending",
      limit: safePageSize,
      offset: (safePage - 1) * safePageSize,
      orderBy: "-created_at",
      ...(trimmed ? { query: trimmed } : {}),
    });

    const total = Number(totalCount) || 0;
    const totalPages = total > 0 ? Math.ceil(total / safePageSize) : 0;

    return {
      entries: (data ?? []).map((entry) => ({
        id: entry.id,
        email: entry.emailAddress,
        status: entry.status,
        createdAt: entry.createdAt,
      })),
      totalCount: total,
      page: safePage,
      pageSize: safePageSize,
      totalPages,
    };
  } catch (error) {
    console.error("Failed to list Clerk waitlist entries:", error);
    return {
      entries: [],
      totalCount: 0,
      page: safePage,
      pageSize: safePageSize,
      totalPages: 0,
    };
  }
}

/**
 * Staff-only: invite (accept) or reject (deny) waitlist entries via Clerk.
 * Cross-user admin surface — see user-data-authorization.mdc.
 */
export async function decideWaitlistEntries({ decision, entryIds }) {
  const actor = await getCurrentAppUser();

  if (!isStaffRole(actor?.roleName)) {
    return { ok: false, error: "You do not have permission to manage the wait list." };
  }

  const ids = [...new Set(entryIds.filter(Boolean))];
  if (!ids.length) {
    return { ok: false, error: "Select at least one wait list entry." };
  }

  const client = await clerkClient();
  const failures = [];

  for (const id of ids) {
    try {
      if (decision === "accept") {
        await client.waitlistEntries.invite(id);
      } else {
        await client.waitlistEntries.reject(id);
      }
    } catch (error) {
      console.error(`Waitlist ${decision} failed for ${id}:`, error);
      failures.push(id);
    }
  }

  if (failures.length === ids.length) {
    return {
      ok: false,
      error:
        decision === "accept"
          ? "Could not accept the selected wait list entries."
          : "Could not deny the selected wait list entries.",
    };
  }

  if (failures.length) {
    return {
      ok: true,
      partial: true,
      error: null,
      message:
        decision === "accept"
          ? `Accepted ${ids.length - failures.length} of ${ids.length} entries.`
          : `Denied ${ids.length - failures.length} of ${ids.length} entries.`,
    };
  }

  return {
    ok: true,
    partial: false,
    error: null,
    message:
      decision === "accept"
        ? ids.length === 1
          ? "Invitation sent."
          : `Accepted ${ids.length} wait list entries.`
        : ids.length === 1
          ? "Wait list entry denied."
          : `Denied ${ids.length} wait list entries.`,
  };
}

/**
 * Staff-only: search Clerk users by name/email and join local role/enabled.
 * Cross-user admin surface — see user-data-authorization.mdc.
 */
export async function searchAppUsers(query) {
  const actor = await getCurrentAppUser();

  if (!isStaffRole(actor?.roleName)) {
    return [];
  }

  const trimmed = query?.trim() ?? "";

  if (trimmed.length < 3) {
    return [];
  }

  const client = await clerkClient();
  const { data: clerkUsers } = await client.users.getUserList({
    query: trimmed,
    limit: 25,
    orderBy: "-created_at",
  });

  const existingByClerkId = await getAppUsersByClerkIds(
    clerkUsers.map((clerkUser) => clerkUser.id),
  );

  const results = [];

  for (const clerkUser of clerkUsers) {
    let appUser = existingByClerkId.get(clerkUser.id);

    if (!appUser) {
      appUser = await ensureAppUser(clerkUser.id);
    }

    if (!appUser) {
      continue;
    }

    results.push({
      id: appUser.id,
      clerkUserId: appUser.clerkUserId,
      roleName: appUser.roleName,
      enabled: appUser.enabled,
      createdAt: appUser.createdAt,
      name: formatClerkDisplayName(clerkUser),
      email: formatClerkEmail(clerkUser),
      canEdit: canManageUser(actor.roleName, appUser.roleName),
    });
  }

  return results;
}

/**
 * Staff-only: load one app user plus Clerk profile for the edit page.
 * Cross-user admin surface — see user-data-authorization.mdc.
 */
export async function getManagedUser(userId) {
  const actor = await getCurrentAppUser();

  if (!isStaffRole(actor?.roleName)) {
    return null;
  }

  const appUser = await getAppUserById(userId);

  if (!appUser) {
    return null;
  }

  if (!canManageUser(actor.roleName, appUser.roleName)) {
    return null;
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(appUser.clerkUserId);

  return {
    id: appUser.id,
    clerkUserId: appUser.clerkUserId,
    roleName: appUser.roleName,
    enabled: appUser.enabled,
    createdAt: appUser.createdAt,
    name: formatClerkDisplayName(clerkUser),
    email: formatClerkEmail(clerkUser),
    isSelf: actor.clerkUserId === appUser.clerkUserId,
    actorRoleName: actor.roleName,
  };
}

/**
 * Staff-only: update role and enabled flag.
 * Cross-user admin surface — see user-data-authorization.mdc.
 */
export async function updateManagedUser({ userId, roleName, enabled }) {
  const actor = await getCurrentAppUser();

  if (!isStaffRole(actor?.roleName)) {
    return { ok: false, error: "You do not have permission to manage users." };
  }

  const appUser = await getAppUserById(userId);

  if (!appUser) {
    return { ok: false, error: "User not found." };
  }

  if (!canManageUser(actor.roleName, appUser.roleName)) {
    return {
      ok: false,
      error: "Admins cannot edit super admin accounts.",
    };
  }

  if (!canAssignRole(actor.roleName, roleName)) {
    return {
      ok: false,
      error: "Admins cannot assign the super admin role.",
    };
  }

  if (actor.clerkUserId === appUser.clerkUserId && enabled === false) {
    return { ok: false, error: "You cannot disable your own account." };
  }

  const nextEnabled =
    actor.clerkUserId === appUser.clerkUserId ? appUser.enabled : enabled;

  const db = getDb();
  const [role] = await db
    .select({ id: userRoles.id })
    .from(userRoles)
    .where(eq(userRoles.name, roleName))
    .limit(1);

  if (!role) {
    return { ok: false, error: "Invalid role." };
  }

  await db
    .update(users)
    .set({
      roleId: role.id,
      enabled: nextEnabled,
    })
    .where(eq(users.id, userId));

  return { ok: true, error: null };
}
