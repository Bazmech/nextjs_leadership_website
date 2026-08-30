import AspectMedia from "@/components/atoms/AspectMedia/AspectMedia";
import Link from "@/components/atoms/Link/Link";
import LockIcon from "@/components/atoms/LockIcon/LockIcon";
import { getLinkLabel, getLinkTarget, isFilledLink } from "@/lib/link-utils";

export default function ListingCard({
  title,
  excerpt,
  image,
  imageSrc,
  imageAlt = "",
  linkHref,
  linkField,
  linkLabel,
  linkTarget,
  locked = false,
  className = "",
}) {
  const label = linkLabel || getLinkLabel(linkField, title);
  const target = getLinkTarget(linkField, linkTarget);
  const hasLink = !locked && Boolean(linkHref || isFilledLink(linkField));

  const card = (
    <article
      className={`group grid h-full overflow-hidden rounded-2xl border border-border bg-surface ${
        locked ? "" : "transition-shadow hover:shadow-lg"
      }`}
    >
      <div className="relative">
        <AspectMedia
          image={image}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          className="rounded-none"
        />
        {locked ? (
          <span className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-sm">
            <LockIcon className="size-5" title="Members only" />
          </span>
        ) : null}
      </div>
      <div className="grid gap-4 p-6">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {excerpt ? (
          <p className="text-sm leading-relaxed text-muted">{excerpt}</p>
        ) : null}
        {locked ? (
          <span className="flex items-center gap-2 text-sm font-medium text-muted">
            <LockIcon className="size-4" />
            Members only
          </span>
        ) : hasLink ? (
          <span className="text-sm font-medium text-primary transition-colors group-hover:text-primary-light">
            {label} →
          </span>
        ) : null}
      </div>
    </article>
  );

  if (!hasLink) {
    return <div className={className}>{card}</div>;
  }

  return (
    <Link
      href={linkHref}
      field={linkField}
      target={target}
      className={`block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`.trim()}
    >
      {card}
    </Link>
  );
}
