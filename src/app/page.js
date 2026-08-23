import Header from "@/components/organisms/Header/Header";
import Hero from "@/components/organisms/Hero/Hero";
import Services from "@/components/organisms/Services/Services";
import About from "@/components/organisms/About/About";
import Footer from "@/components/organisms/Footer/Footer";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { buildPrismicMetadata, defaultSiteMetadata } from "@/lib/prismic-seo";
import { getSiteSettings } from "@/lib/prismic-settings";
import { components } from "@/slices";

function StaticHome() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <About />
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata() {
  try {
    const [client, settings] = await Promise.all([createClient(), getSiteSettings()]);
    const homepage = await client.getSingle("homepage");

    return buildPrismicMetadata(homepage, { path: "/", settings });
  } catch {
    return defaultSiteMetadata;
  }
}

export default async function Home() {
  let homepage = null;

  try {
    const client = createClient();
    homepage = await client.getSingle("homepage");
  } catch (error) {
    console.warn("Prismic homepage unavailable, using static fallback:", error.message);
  }

  if (homepage?.data.slices?.length > 0) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <SliceZone slices={homepage.data.slices} components={components} />
        </main>
        <Footer />
      </>
    );
  }

  return <StaticHome />;
}
