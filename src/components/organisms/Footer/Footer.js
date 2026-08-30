import Image from "next/image";
import Container from "@/components/atoms/Container/Container";
import Link from "@/components/atoms/Link/Link";
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
      <Container className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-4">
          <div className="grid w-fit grid-cols-1 items-start gap-4 sm:grid-cols-[auto_auto] sm:items-center">
            <Link href="/" className="inline-grid">
              <Image
                src="/logo.png"
                alt={settings.siteName}
                width={810}
                height={748}
                className={`${footerLogoClassName} shrink-0`}
              />
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
        <div className="grid gap-4 justify-self-center md:justify-self-end">
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
