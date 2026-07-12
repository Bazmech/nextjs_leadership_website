import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { buildSimplePageMetadata } from "@/lib/prismic-seo";
import { getSiteSettings } from "@/lib/prismic-settings";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return buildSimplePageMetadata(
    "Sign In",
    `Sign in to your ${settings.siteName} account.`,
  );
}

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <SignIn
        appearance={{
          ...clerkAppearance,
          elements: {
            ...clerkAppearance.elements,
            rootBox: "mx-auto",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
      />
    </main>
  );
}
