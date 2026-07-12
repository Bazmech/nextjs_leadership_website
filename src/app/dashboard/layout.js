import { auth } from "@clerk/nextjs/server";
import Footer from "@/components/organisms/Footer/Footer";
import Header from "@/components/organisms/Header/Header";
import { ensureAppUser } from "@/lib/users";

export default async function DashboardLayout({ children }) {
  const { userId } = await auth();
  let appUser = null;

  if (userId) {
    try {
      appUser = await ensureAppUser(userId);
    } catch (error) {
      console.error("ensureAppUser failed:", error);
    }
  }

  if (appUser && !appUser.enabled) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="bg-background px-6 py-16">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Account disabled
              </h1>
              <p className="mt-3 text-lg text-muted">
                Your account has been disabled. Contact an administrator if you
                believe this is a mistake.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
