import { ClerkProvider } from "@clerk/nextjs";
import { PrismicPreview } from "@prismicio/next";
import { Geist, Geist_Mono } from "next/font/google";
import { clerkAppearance } from "@/lib/clerk-appearance";
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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
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
      </body>
    </html>
  );
}
