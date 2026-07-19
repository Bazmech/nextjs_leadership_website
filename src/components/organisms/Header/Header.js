import AuthNav from "@/components/molecules/AuthNav/AuthNav";
import NavMenuList from "@/components/molecules/NavMenuList/NavMenuList";
import Button from "@/components/atoms/Button/Button";
import Container from "@/components/atoms/Container/Container";
import Logo from "@/components/molecules/Logo/Logo";
import { getHeaderMenuLinks } from "@/lib/prismic-header-menu";
import { getSiteSettings } from "@/lib/prismic-settings";
import { getCurrentAppUser } from "@/lib/users";

export default async function Header() {
  const [settings, menuItems, appUser] = await Promise.all([
    getSiteSettings(),
    getHeaderMenuLinks(),
    getCurrentAppUser(),
  ]);
  const accountDisabled = Boolean(appUser && !appUser.enabled);

  return (
    <header className="sticky top-0 z-50 bg-primary text-white">
      <Container className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 md:grid-cols-[auto_1fr_auto]">
        <Logo className="text-white" />
        <nav className="hidden justify-self-center md:block" aria-label="Main">
          <NavMenuList
            items={menuItems}
            className="grid grid-flow-col gap-8"
            variant="dropdown"
            tone="inverse"
          />
        </nav>
        <div className="grid grid-flow-col items-center justify-end gap-4">
          {!accountDisabled ? (
            <Button
              as="a"
              href={settings.headerCtaHref}
              variant="on-primary-sm"
              className="hidden sm:inline-flex"
            >
              {settings.headerCtaLabel}
            </Button>
          ) : null}
          <AuthNav inverse showUserLinks={!accountDisabled} />
        </div>
      </Container>
    </header>
  );
}
