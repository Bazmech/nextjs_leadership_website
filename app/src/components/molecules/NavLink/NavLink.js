import Link from "@/components/atoms/Link/Link";

const tones = {
  default: "text-muted transition-colors hover:text-foreground",
  inverse: "text-white/90 transition-colors hover:text-white",
};

export default function NavLink({ href, children, className = "", tone = "default", ...props }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium ${tones[tone] ?? tones.default} ${className}`.trim()}
      {...props}
    >
      {children}
    </Link>
  );
}
