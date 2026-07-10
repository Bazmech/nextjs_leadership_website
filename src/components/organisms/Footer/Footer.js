import Container from "@/components/atoms/Container/Container";
import NavLink from "@/components/molecules/NavLink/NavLink";
import { getSiteSettings } from "@/lib/prismic-settings";
import { mainNavLinks } from "@/lib/site-nav";

export default async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface py-12">
      <Container className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-3">
          <p className="text-sm text-muted">
            &copy; {year} {settings.footerCopyright}. All rights reserved.
          </p>
          {settings.contactEmail || settings.contactPhone ? (
            <p className="text-sm text-muted">
              {settings.contactEmail ? (
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-foreground">
                  {settings.contactEmail}
                </a>
              ) : null}
              {settings.contactEmail && settings.contactPhone ? (
                <span className="mx-2">·</span>
              ) : null}
              {settings.contactPhone ? (
                <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="hover:text-foreground">
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
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <ul className="grid grid-flow-col gap-6">
            {mainNavLinks.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
