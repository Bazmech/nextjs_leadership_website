import Footer from "@/components/organisms/Footer/Footer";
import Header from "@/components/organisms/Header/Header";
import { requireEnabledAppUser } from "@/lib/users";

export default async function DashboardLayout({ children }) {
  await requireEnabledAppUser();

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
