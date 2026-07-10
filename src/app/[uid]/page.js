import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import Header from "@/components/organisms/Header/Header";
import Footer from "@/components/organisms/Footer/Footer";
import { createClient } from "@/prismicio";
import { buildPrismicMetadata } from "@/lib/prismic-seo";
import { getSiteSettings } from "@/lib/prismic-settings";
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

  try {
    const client = createClient();
    const page = await client.getByUID("page", uid);

    return (
      <>
        <Header />
        <main>
          <SliceZone slices={page.data.slices} components={components} />
        </main>
        <Footer />
      </>
    );
  } catch {
    notFound();
  }
}
