/** CMS / visibility tier for anonymous visitors (not a DB `user_roles` row). */
export const PUBLIC_ROLE_NAME = "public";

/** App roles seeded in `user_roles`, plus Public for CMS visibility. */
export const VISIBILITY_ROLE_NAMES = [
  PUBLIC_ROLE_NAME,
  "default",
  "admin",
  "super_admin",
];

/**
 * Cascading visibility rank. Higher ranks include all lower tiers:
 * Public ⊂ default ⊂ admin ⊂ super_admin
 */
export const ROLE_VISIBILITY_RANK = {
  [PUBLIC_ROLE_NAME]: 0,
  default: 1,
  admin: 2,
  super_admin: 3,
};

/**
 * Normalize Prismic Select / display labels to canonical role ids.
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function normalizeVisibilityRole(value) {
  if (!value || typeof value !== "string") {
    return PUBLIC_ROLE_NAME;
  }

  const trimmed = value.trim().toLowerCase().replace(/\s+/g, "_");

  if (trimmed === "public" || trimmed === "anonymous" || trimmed === "guest") {
    return PUBLIC_ROLE_NAME;
  }

  if (trimmed === "superadmin") {
    return "super_admin";
  }

  if (trimmed in ROLE_VISIBILITY_RANK) {
    return trimmed;
  }

  return PUBLIC_ROLE_NAME;
}

/**
 * Viewer role for cascade checks: session app role, or Public when signed out.
 * @param {string | null | undefined} appRoleName — from `users` / `user_roles`
 */
export function getViewerVisibilityRole(appRoleName) {
  if (!appRoleName) {
    return PUBLIC_ROLE_NAME;
  }

  return normalizeVisibilityRole(appRoleName);
}

/**
 * Cascading visibility: a viewer can see an item if their rank is ≥ the item’s required role.
 * @param {string | null | undefined} viewerRole
 * @param {string | null | undefined} requiredRole
 */
export function canAccessByRole(viewerRole, requiredRole) {
  const viewer = normalizeVisibilityRole(viewerRole);
  const required = normalizeVisibilityRole(requiredRole);

  return ROLE_VISIBILITY_RANK[viewer] >= ROLE_VISIBILITY_RANK[required];
}
