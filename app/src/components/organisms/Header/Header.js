import AuthNav from "@/components/molecules/AuthNav/AuthNav";
import MobileNav from "@/components/molecules/MobileNav/MobileNav";
import NavMenuList from "@/components/molecules/NavMenuList/NavMenuList";
import Container from "@/components/atoms/Container/Container";
import Logo from "@/components/molecules/Logo/Logo";
import { getHeaderMenuLinks } from "@/lib/header-menu";
import { getCurrentAppUser } from "@/lib/users";

export default async function Header() {
  const [menuItems, appUser] = await Promise.all([
    getHeaderMenuLinks(),
    getCurrentAppUser(),
  ]);
  const accountDisabled = Boolean(appUser && !appUser.enabled);
  const showUserLinks = !accountDisabled;

  return (
    <header className="sticky top-0 z-50 bg-primary text-white">
      <Container className="items-center py-4">
        <Logo className="col-span-8 text-white md:col-span-4" />
        <nav
          className="col-span-5 hidden justify-self-center md:grid"
          aria-label="Main"
        >
          <NavMenuList
            items={menuItems}
            className="grid grid-flow-col gap-8"
            variant="dropdown"
            tone="inverse"
          />
        </nav>
        <div className="col-span-4 grid grid-flow-col items-center justify-end gap-3 md:col-span-3">
          <div className="hidden md:block">
            <AuthNav inverse showUserLinks={showUserLinks} />
          </div>
          <MobileNav menuItems={menuItems} showUserLinks={showUserLinks} />
        </div>
      </Container>
    </header>
  );
}
