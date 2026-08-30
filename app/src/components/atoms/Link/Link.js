import NextLink from "next/link";
import { getLinkTarget, isFilledLink, resolveLinkHref } from "@/lib/link-utils";

export default function Link({
  href,
  field,
  target,
  className = "",
  children,
  ...props
}) {
  const resolvedHref = resolveLinkHref(field, href);
  const resolvedTarget = getLinkTarget(field, target);
  const classes = className.trim();

  if (!resolvedHref && !isFilledLink(field)) {
    return (
      <span className={classes} {...props}>
        {children}
      </span>
    );
  }

  if (!resolvedHref) {
    return (
      <span className={classes} {...props}>
        {children}
      </span>
    );
  }

  const isExternal =
    resolvedTarget === "_blank" ||
    resolvedHref.startsWith("http") ||
    resolvedHref.startsWith("mailto:");

  if (isExternal) {
    return (
      <a
        href={resolvedHref}
        target={resolvedTarget ?? "_blank"}
        rel="noopener noreferrer"
        className={classes}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={resolvedHref} target={resolvedTarget} className={classes} {...props}>
      {children}
    </NextLink>
  );
}
