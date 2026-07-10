import { PrismicRichText } from "@prismicio/react";
import Link from "@/components/atoms/Link/Link";

export const richTextComponents = {
  heading1: ({ children }) => (
    <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
      {children}
    </h1>
  ),
  heading2: ({ children }) => (
    <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
      {children}
    </h2>
  ),
  heading3: ({ children }) => (
    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
      {children}
    </h3>
  ),
  heading4: ({ children }) => (
    <h4 className="text-xl font-semibold text-foreground">{children}</h4>
  ),
  heading5: ({ children }) => (
    <h5 className="text-lg font-semibold text-foreground">{children}</h5>
  ),
  heading6: ({ children }) => (
    <h6 className="text-base font-semibold text-foreground">{children}</h6>
  ),
  paragraph: ({ children }) => (
    <p className="leading-relaxed text-muted [&:not(:first-child)]:mt-4">{children}</p>
  ),
  preformatted: ({ children }) => (
    <pre className="overflow-x-auto rounded-xl border border-border bg-surface p-4 text-sm text-foreground">
      {children}
    </pre>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  listItem: ({ children }) => (
    <li className="leading-relaxed text-muted">{children}</li>
  ),
  oListItem: ({ children }) => (
    <li className="leading-relaxed text-muted">{children}</li>
  ),
  list: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6">{children}</ul>
  ),
  oList: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6">{children}</ol>
  ),
  hyperlink: ({ node, children }) => (
    <Link
      field={{
        link_type: node.data.link_type,
        url: node.data.url,
        target: node.data.target,
        text: node.data.label,
      }}
      className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-light"
    >
      {children}
    </Link>
  ),
};

export default function RichText({ field, className = "" }) {
  if (!field) return null;

  return (
    <div className={`rich-text ${className}`.trim()}>
      <PrismicRichText field={field} components={richTextComponents} />
    </div>
  );
}
