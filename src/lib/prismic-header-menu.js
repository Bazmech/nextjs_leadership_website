import { cache } from "react";
import { createClient } from "@/prismicio";
import { resolveLinkHref } from "@/lib/link-utils";
import {
  canAccessByRole,
  getViewerVisibilityRole,
  normalizeVisibilityRole,
  PUBLIC_ROLE_NAME,
} from "@/lib/roles";
import { mainNavLinks } from "@/lib/site-nav";
import { getCurrentAppUser } from "@/lib/users";

function getLabel(value, fallback = "") {
  if (!value || typeof value !== "string") return fallback;
  return value.trim() || fallback;
}

/**
 * Map flat Prismic group rows into a tree using optional `parent_label`.
 * Children reference a parent by matching that parent’s `label`.
 */
function buildMenuTree(rows = []) {
  const items = rows
    .map((row, index) => {
      const label = getLabel(row?.label);
      if (!label) return null;

      return {
        id: `${label}-${index}`,
        label,
        href: resolveLinkHref(row?.link) || null,
        requiredRole: normalizeVisibilityRole(row?.required_role),
        parentLabel: getLabel(row?.parent_label) || null,
        children: [],
      };
    })
    .filter(Boolean);

  const byLabel = new Map();
  for (const item of items) {
    if (!byLabel.has(item.label)) {
      byLabel.set(item.label, item);
    }
  }

  const roots = [];

  for (const item of items) {
    if (!item.parentLabel) {
      roots.push(item);
      continue;
    }

    const parent = byLabel.get(item.parentLabel);
    if (parent && parent !== item) {
      parent.children.push(item);
    } else {
      roots.push(item);
    }
  }

  return roots;
}

function filterMenuTree(items, viewerRole) {
  return items
    .filter((item) => canAccessByRole(viewerRole, item.requiredRole))
    .map((item) => ({
      ...item,
      children: filterMenuTree(item.children, viewerRole),
    }));
}

/** Drop authenticated app routes (dashboard, etc.) from nav. */
function stripUserPageLinks(items) {
  return items
    .filter((item) => {
      const href = item.href?.trim() ?? "";
      return !href.startsWith("/dashboard");
    })
    .map((item) => ({
      ...item,
      children: stripUserPageLinks(item.children),
    }));
}

function mapFallbackLinks() {
  return mainNavLinks.map((link, index) => ({
    id: `fallback-${index}`,
    label: link.label,
    href: link.href,
    requiredRole: PUBLIC_ROLE_NAME,
    parentLabel: null,
    children: [],
  }));
}

export const getHeaderMenuDocument = cache(async () => {
  try {
    const client = createClient();
    return await client.getSingle("header_menu");
  } catch {
    return null;
  }
});

/**
 * Header/footer nav tree for the current session, filtered by cascading role visibility.
 * Disabled accounts only see Public links (no user-page nav).
 */
export const getHeaderMenuLinks = cache(async () => {
  const appUser = await getCurrentAppUser();
  const accountDisabled = Boolean(appUser && !appUser.enabled);
  const viewerRole = accountDisabled
    ? PUBLIC_ROLE_NAME
    : getViewerVisibilityRole(appUser?.roleName);

  const document = await getHeaderMenuDocument();
  const rows = document?.data?.menu_items;
  const tree =
    Array.isArray(rows) && rows.length > 0
      ? buildMenuTree(rows)
      : mapFallbackLinks();

  const filtered = filterMenuTree(tree, viewerRole);
  return accountDisabled ? stripUserPageLinks(filtered) : filtered;
});
