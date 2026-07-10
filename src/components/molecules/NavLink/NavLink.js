import Link from "@/components/atoms/Link/Link";

export default function NavLink({ href, children, className = "" }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium text-muted transition-colors hover:text-foreground ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
