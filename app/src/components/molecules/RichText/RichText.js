import { PortableText } from "@portabletext/react";
import Link from "@/components/atoms/Link/Link";
import { isPortableText } from "@/lib/cms-field";
import { resolveLinkHref } from "@/lib/link-utils";

export const richTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold tracking-tight text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-semibold text-foreground">{children}</h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-lg font-semibold text-foreground">{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-base font-semibold text-foreground">{children}</h6>
    ),
    normal: ({ children }) => (
      <p className="leading-relaxed text-muted [&:not(:first-child)]:mt-4">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-4 border-l-2 border-border pl-4 text-muted">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-2 pl-6">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-2 pl-6">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="leading-relaxed text-muted">{children}</li>
    ),
    number: ({ children }) => (
      <li className="leading-relaxed text-muted">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <Link
        field={value}
        href={resolveLinkHref(value)}
        className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-light"
      >
        {children}
      </Link>
    ),
  },
};

export default function RichText({ field, className = "" }) {
  if (!isPortableText(field)) return null;

  return (
    <div className={`rich-text ${className}`.trim()}>
      <PortableText value={field} components={richTextComponents} />
    </div>
  );
}
