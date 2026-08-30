import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { buildSimplePageMetadata } from "@/lib/site-seo";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata() {
  const settings = await getSiteSettings();

  return buildSimplePageMetadata(
    "Sign Up",
    `Create your ${settings.siteName} account.`,
  );
}

export default function SignUpPage() {
  return (
    <main className="grid min-h-full place-items-center bg-background px-6 py-16">
      <SignUp
        appearance={{
          ...clerkAppearance,
          elements: {
            ...clerkAppearance.elements,
            rootBox: "mx-auto",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
      />
    </main>
  );
}
