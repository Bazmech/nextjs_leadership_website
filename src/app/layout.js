import { ClerkProvider } from "@clerk/nextjs";
import { PrismicPreview } from "@prismicio/next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { COOKIEBOT_CBID, shouldLoadCookiebot } from "@/lib/cookiebot";
import { buildRootMetadata } from "@/lib/prismic-seo";
import { repositoryName } from "@/prismicio";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  return buildRootMetadata();
}

export default function RootLayout({ children }) {
  const loadCookiebot = shouldLoadCookiebot();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {loadCookiebot ? (
          <Script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            strategy="beforeInteractive"
            data-cbid={COOKIEBOT_CBID}
            data-blockingmode="auto"
          />
        ) : null}
        <ClerkProvider
          appearance={clerkAppearance}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          afterSignOutUrl="/"
        >
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
        </ClerkProvider>
        <PrismicPreview repositoryName={repositoryName} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
