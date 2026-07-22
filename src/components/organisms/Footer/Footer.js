import Container from "@/components/atoms/Container/Container";
import NavMenuList from "@/components/molecules/NavMenuList/NavMenuList";
import { getHeaderMenuLinks } from "@/lib/prismic-header-menu";
import { getSiteSettings } from "@/lib/prismic-settings";

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
        <div className="grid gap-3">
          <p className="text-sm text-white/90">
            &copy; {year} Productive Leadership produced in partnership with{" "}
            <a
              href="https://www.horizonsnhs.com"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 transition-colors hover:text-white underline"
            >
              NHS Horizons
            </a>
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
