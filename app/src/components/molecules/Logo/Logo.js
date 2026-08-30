import Link from "next/link";
import LogoMark from "@/components/atoms/LogoMark/LogoMark";
import { getSiteSettings } from "@/lib/site-settings";

export default async function Logo({ className = "text-primary" }) {
  const settings = await getSiteSettings();
  const accent = settings.logoAccent;
  const label = settings.logoLabel;
  const primaryText =
    accent && label.endsWith(accent) ? label.slice(0, -accent.length) : label;

  return (
    <Link
      href="/"
      className={`flex items-center gap-3 ${className}`.trim()}
    >
      <LogoMark priority />
      <span className="text-xl font-semibold tracking-tight">
        {primaryText}
        {accent ? <span>{accent}</span> : null}
      </span>
    </Link>
  );
}
