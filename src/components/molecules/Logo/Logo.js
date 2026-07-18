import Link from "next/link";
import { getSiteSettings } from "@/lib/prismic-settings";

export default async function Logo({ className = "text-primary" }) {
  const settings = await getSiteSettings();
  const accent = settings.logoAccent;
  const label = settings.logoLabel;
  const primaryText = accent && label.endsWith(accent) ? label.slice(0, -accent.length) : label;

  return (
    <Link
      href="/"
      className={`text-xl font-semibold tracking-tight ${className}`.trim()}
    >
      {primaryText}
      {accent ? <span>{accent}</span> : null}
    </Link>
  );
}
