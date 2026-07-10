import Header from "@/components/organisms/Header/Header";
import Hero from "@/components/organisms/Hero/Hero";
import Services from "@/components/organisms/Services/Services";
import About from "@/components/organisms/About/About";
import Cta from "@/components/organisms/Cta/Cta";
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
      <main>
        <Hero />
        <Services />
        <About />
        <Cta />
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
  try {
    const client = createClient();
    const homepage = await client.getSingle("homepage");

    if (homepage.data.slices?.length > 0) {
      return (
        <>
          <Header />
          <main>
            <SliceZone slices={homepage.data.slices} components={components} />
          </main>
          <Footer />
        </>
      );
    }
  } catch (error) {
    console.warn("Prismic homepage unavailable, using static fallback:", error.message);
  }

  return <StaticHome />;
}
