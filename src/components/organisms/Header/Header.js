import AuthNav from "@/components/molecules/AuthNav/AuthNav";
import Button from "@/components/atoms/Button/Button";
import Container from "@/components/atoms/Container/Container";
import Logo from "@/components/molecules/Logo/Logo";
import NavLink from "@/components/molecules/NavLink/NavLink";
import { getSiteSettings } from "@/lib/prismic-settings";
import { mainNavLinks } from "@/lib/site-nav";

export default async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <Container className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 md:grid-cols-[auto_1fr_auto]">
        <Logo />
        <nav className="hidden justify-self-center md:block">
          <ul className="grid grid-flow-col gap-8">
            {mainNavLinks.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid grid-flow-col items-center justify-end gap-4">
          <Button
            as="a"
            href={settings.headerCtaHref}
            variant="accent-sm"
            className="hidden sm:inline-flex"
          >
            {settings.headerCtaLabel}
          </Button>
          <AuthNav />
        </div>
      </Container>
    </header>
  );
}
