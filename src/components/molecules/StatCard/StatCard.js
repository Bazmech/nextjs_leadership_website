import Link from "@/components/atoms/Link/Link";

export default function StatCard({ value, label, href }) {
  const valueClassName = href
    ? "text-3xl font-bold text-primary transition-colors group-hover:text-primary-light group-hover:underline"
    : "text-3xl font-bold text-primary";

  const body = (
    <>
      <dt className={valueClassName}>{value}</dt>
      <dd className="mt-1 text-sm text-muted">{label}</dd>
    </>
  );

  if (href) {
    return (
      <div>
        <Link
          href={href}
          className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {body}
        </Link>
      </div>
    );
  }

  return <div>{body}</div>;
}
