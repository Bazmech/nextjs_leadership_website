import Image from "next/image";
import Link from "next/link";
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
      className={`grid grid-cols-[auto_auto] items-center gap-3 ${className}`.trim()}
    >
      <Image
        src="/logo.png"
        alt=""
        width={810}
        height={748}
        priority
        className="h-10 w-auto shrink-0"
      />
      <span className="text-xl font-semibold tracking-tight">
        {primaryText}
        {accent ? <span>{accent}</span> : null}
      </span>
    </Link>
  );
}
