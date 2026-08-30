import Header from "@/components/organisms/Header/Header";
import Hero from "@/components/organisms/Hero/Hero";
import Services from "@/components/organisms/Services/Services";
import About from "@/components/organisms/About/About";
import Footer from "@/components/organisms/Footer/Footer";
import SliceZone from "@/components/organisms/SliceZone/SliceZone";
import { buildPageMetadata, defaultSiteMetadata } from "@/lib/site-seo";
import { getSiteSettings } from "@/lib/site-settings";
import { sanityFetch } from "@/sanity/lib/client";
import { homepageQuery } from "@/sanity/lib/queries";
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
    const [homepage, settings] = await Promise.all([
      sanityFetch(homepageQuery),
      getSiteSettings(),
    ]);

    if (!homepage) return defaultSiteMetadata;

    return buildPageMetadata(homepage, { path: "/", settings });
  } catch {
    return defaultSiteMetadata;
  }
}

export default async function Home() {
  let homepage = null;

  try {
    homepage = await sanityFetch(homepageQuery);
  } catch (error) {
    console.warn("Sanity homepage unavailable, using static fallback:", error.message);
  }

  if (homepage?.slices?.length > 0) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <SliceZone slices={homepage.slices} components={components} />
        </main>
        <Footer />
      </>
    );
  }

  return <StaticHome />;
}
