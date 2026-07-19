import { notFound, redirect } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import Header from "@/components/organisms/Header/Header";
import Footer from "@/components/organisms/Footer/Footer";
import { createClient } from "@/prismicio";
import { buildPrismicMetadata } from "@/lib/prismic-seo";
import { getSiteSettings } from "@/lib/prismic-settings";
import { getCurrentAppUser } from "@/lib/users";
import { components } from "@/slices";

export async function generateMetadata({ params }) {
  const { uid } = await params;

  try {
    const [client, settings] = await Promise.all([createClient(), getSiteSettings()]);
    const page = await client.getByUID("page", uid);

    return buildPrismicMetadata(page, { path: `/${uid}`, settings });
  } catch {
    return { title: "Page not found" };
  }
}

export async function generateStaticParams() {
  try {
    const client = createClient();
    const pages = await client.getAllByType("page");

    return pages.map((page) => ({ uid: page.uid }));
  } catch {
    return [];
  }
}

export default async function Page({ params }) {
  const { uid } = await params;
  const path = `/${uid}`;
  const [client, settings] = await Promise.all([
    createClient(),
    getSiteSettings(),
  ]);

  let page;
  try {
    page = await client.getByUID("page", uid);
  } catch {
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
      <main className="flex-1">
        <SliceZone slices={page.data.slices} components={components} />
      </main>
      <Footer />
    </>
  );
}
