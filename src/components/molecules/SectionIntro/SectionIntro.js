import Link from "@/components/atoms/Link/Link";
import RichText from "@/components/molecules/RichText/RichText";
import { getLinkLabel } from "@/lib/link-utils";

export default function SectionIntro({
  title,
  subtitle,
  text,
  linkHref,
  linkField,
  linkLabel,
  linkTarget,
  className = "",
}) {
  if (!title) return null;

  const label = linkLabel || getLinkLabel(linkField);

  return (
    <div className={`mx-auto max-w-2xl text-center ${className}`.trim()}>
      <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-accent">
          {subtitle}
        </p>
      ) : null}
      {text ? <div className="mt-4"><RichText field={text} /></div> : null}
      {linkHref || linkField ? (
        <div className="mt-8">
          <Link
            href={linkHref}
            field={linkField}
            target={linkTarget}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            {label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
