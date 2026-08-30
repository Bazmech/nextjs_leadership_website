import { cache } from "react";
import { resolveLinkHref } from "@/lib/link-utils";
import {
  canAccessByRole,
  getViewerVisibilityRole,
  normalizeVisibilityRole,
  PUBLIC_ROLE_NAME,
} from "@/lib/roles";
import { mainNavLinks, removedNavLabels } from "@/lib/site-nav";
import { getCurrentAppUser } from "@/lib/users";
import { sanityFetch } from "@/sanity/lib/client";
import { headerMenuQuery } from "@/sanity/lib/queries";

const removedNavLabelSet = new Set(
  removedNavLabels.map((label) => label.trim().toLowerCase()),
);

function getLabel(value, fallback = "") {
  if (!value || typeof value !== "string") return fallback;
  return value.trim() || fallback;
}

/**
 * Map flat CMS group rows into a tree using optional `parentLabel`.
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
        requiredRole: normalizeVisibilityRole(row?.requiredRole),
        parentLabel: getLabel(row?.parentLabel) || null,
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

function stripRemovedNavItems(items) {
  return items
    .filter((item) => !removedNavLabelSet.has(item.label.trim().toLowerCase()))
    .map((item) => ({
      ...item,
      children: stripRemovedNavItems(item.children),
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

/**
 * Role-gated nav tree for the current session.
 * Disabled accounts only see Public links (no user-page nav).
 */
export async function resolveCmsMenuLinks(rows, { fallback = [] } = {}) {
  const appUser = await getCurrentAppUser();
  const accountDisabled = Boolean(appUser && !appUser.enabled);
  const viewerRole = accountDisabled
    ? PUBLIC_ROLE_NAME
    : getViewerVisibilityRole(appUser?.roleName);

  const tree =
    Array.isArray(rows) && rows.length > 0
      ? buildMenuTree(rows)
      : fallback;

  const filtered = stripRemovedNavItems(filterMenuTree(tree, viewerRole));
  return accountDisabled ? stripUserPageLinks(filtered) : filtered;
}

export const getHeaderMenuDocument = cache(async () => {
  return sanityFetch(headerMenuQuery);
});

export const getHeaderMenuLinks = cache(async () => {
  const document = await getHeaderMenuDocument();
  return resolveCmsMenuLinks(document?.menuItems, {
    fallback: mapFallbackLinks(),
  });
});
