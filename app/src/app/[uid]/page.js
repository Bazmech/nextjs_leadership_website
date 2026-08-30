import { notFound, redirect } from "next/navigation";
import Header from "@/components/organisms/Header/Header";
import Footer from "@/components/organisms/Footer/Footer";
import SliceZone from "@/components/organisms/SliceZone/SliceZone";
import { buildPageMetadata } from "@/lib/site-seo";
import { getSiteSettings } from "@/lib/site-settings";
import { getCurrentAppUser } from "@/lib/users";
import { sanityFetch } from "@/sanity/lib/client";
import { pageBySlugQuery, pageSlugsQuery } from "@/sanity/lib/queries";
import { components } from "@/slices";

export async function generateMetadata({ params }) {
  const { uid } = await params;

  try {
    const [page, settings] = await Promise.all([
      sanityFetch(pageBySlugQuery, { uid }),
      getSiteSettings(),
    ]);

    if (!page) return { title: "Page not found" };

    return buildPageMetadata(page, { path: `/${uid}`, settings });
  } catch {
    return { title: "Page not found" };
  }
}

export async function generateStaticParams() {
  try {
    const pages = await sanityFetch(pageSlugsQuery);
    if (!Array.isArray(pages)) return [];
    return pages.filter((page) => page?.uid).map((page) => ({ uid: page.uid }));
  } catch {
    return [];
  }
}

export default async function Page({ params }) {
  const { uid } = await params;
  const path = `/${uid}`;
  const [page, settings] = await Promise.all([
    sanityFetch(pageBySlugQuery, { uid }),
    getSiteSettings(),
  ]);

  if (!page) {
    notFound();
  }

  if (settings.accountDisabledPath === path) {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      redirect("/sign-in");
    }

    if (appUser.enabled) {
      redirect("/dashboard");
    }
  }

  return (
    <>
      <Header />
      <main>
        <SliceZone slices={page.slices} components={components} />
      </main>
      <Footer />
    </>
  );
}
