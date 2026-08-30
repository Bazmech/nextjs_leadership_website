import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { buildSimplePageMetadata } from "@/lib/site-seo";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return buildSimplePageMetadata(
    "Sign In",
    `Sign in to your ${settings.siteName} account.`,
  );
}

export default function SignInPage() {
  return (
    <main className="grid min-h-full place-items-center bg-background px-6 py-16">
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
