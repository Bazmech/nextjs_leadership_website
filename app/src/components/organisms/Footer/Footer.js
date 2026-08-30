import Image from "next/image";
import Container from "@/components/atoms/Container/Container";
import Link from "@/components/atoms/Link/Link";
import LogoMark from "@/components/atoms/LogoMark/LogoMark";
import NavMenuList from "@/components/molecules/NavMenuList/NavMenuList";
import { getHeaderMenuLinks } from "@/lib/header-menu";
import { getSiteSettings } from "@/lib/site-settings";

const HORIZONS_URL = "https://www.horizonsnhs.com";
const footerLogoClassName = "h-12 w-auto";

function flattenMenuItems(items = []) {
  return items.flatMap((item) => [
    { ...item, children: [] },
    ...flattenMenuItems(item.children),
  ]);
}

export default async function Footer() {
  const [settings, menuItems] = await Promise.all([
    getSiteSettings(),
    getHeaderMenuLinks(),
  ]);
  const footerLinks = flattenMenuItems(menuItems);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary py-12 text-white">
      <Container className="items-center">
        <div className="col-span-12 grid gap-4 md:col-span-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="inline-grid">
              <LogoMark alt={settings.siteName} className="size-14" />
            </Link>
            <Link href={HORIZONS_URL} className="inline-grid">
              <Image
                src="/horizons-logo.png"
                alt="NHS Horizons"
                width={720}
                height={142}
                className={footerLogoClassName}
              />
            </Link>
          </div>
          <p className="text-sm text-white/90">
            &copy; {year} Productive Leadership produced in partnership with{" "}
            <Link
              href={HORIZONS_URL}
              className="underline-offset-2 transition-colors hover:text-white underline"
            >
              NHS Horizons
            </Link>
          </p>
          {settings.contactEmail || settings.contactPhone ? (
            <p className="text-sm text-white/90">
              {settings.contactEmail ? (
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                  {settings.contactEmail}
                </a>
              ) : null}
              {settings.contactEmail && settings.contactPhone ? (
                <span className="mx-2">·</span>
              ) : null}
              {settings.contactPhone ? (
                <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="hover:text-white">
                  {settings.contactPhone}
                </a>
              ) : null}
            </p>
          ) : null}
        </div>
        <div className="col-span-12 grid gap-4 md:col-span-4 md:justify-self-end">
          {settings.socialLinks.length > 0 ? (
            <ul className="grid grid-flow-col gap-4">
              {settings.socialLinks.map((link) => (
                <li key={`${link.platform}-${link.href}`}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/90 transition-colors hover:text-white"
                  >
                    {link.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <nav aria-label="Footer">
            <NavMenuList
              items={footerLinks}
              className="grid grid-flow-col gap-6"
              variant="inline"
              tone="inverse"
            />
          </nav>
        </div>
      </Container>
    </footer>
  );
}
