import AspectMedia from "@/components/atoms/AspectMedia/AspectMedia";
import Link from "@/components/atoms/Link/Link";
import { getLinkLabel, getLinkTarget } from "@/lib/link-utils";

export default function ListingCard({
  title,
  image,
  imageSrc,
  imageAlt = "",
  linkHref,
  linkField,
  linkLabel,
  linkTarget,
}) {
  const label = linkLabel || getLinkLabel(linkField, title);
  const target = getLinkTarget(linkField, linkTarget);
  const hasLink = Boolean(linkHref || linkField?.url || linkField?.link_type === "Document");

  const card = (
    <article className="group grid h-full overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg">
      <AspectMedia
        image={image}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        className="rounded-none"
      />
      <div className="grid gap-4 p-6">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {hasLink ? (
          <span className="text-sm font-medium text-primary transition-colors group-hover:text-primary-light">
            {label} →
          </span>
        ) : null}
      </div>
    </article>
  );

  if (!hasLink) return card;

  return (
    <Link
      href={linkHref}
      field={linkField}
      target={target}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {card}
    </Link>
  );
}
