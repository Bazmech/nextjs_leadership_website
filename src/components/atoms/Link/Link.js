import { PrismicNextLink } from "@prismicio/next";
import NextLink from "next/link";
import { getLinkTarget, isFilledLink } from "@/lib/link-utils";

export default function Link({
  href,
  field,
  target,
  className = "",
  children,
  ...props
}) {
  const resolvedTarget = getLinkTarget(field, target);
  const classes = className.trim();

  if (isFilledLink(field)) {
    return (
      <PrismicNextLink
        field={field}
        target={resolvedTarget}
        rel={resolvedTarget === "_blank" ? "noopener noreferrer" : undefined}
        className={classes}
        {...props}
      >
        {children}
      </PrismicNextLink>
    );
  }

  if (!href) {
    return (
      <span className={classes} {...props}>
        {children}
      </span>
    );
  }

  const isExternal =
    resolvedTarget === "_blank" || href.startsWith("http") || href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a
        href={href}
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
    <NextLink href={href} target={resolvedTarget} className={classes} {...props}>
      {children}
    </NextLink>
  );
}
