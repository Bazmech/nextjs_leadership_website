import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { projectId } from "@/sanity/env";

export const dynamic = "force-static";

export default function StudioPage() {
  if (!projectId) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
        <div className="grid max-w-md gap-3">
          <h1 className="text-2xl font-semibold text-foreground">
            Sanity Studio is not configured
          </h1>
          <p className="text-muted">
            Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{" "}
            <code>NEXT_PUBLIC_SANITY_DATASET</code> in{" "}
            <code>.env.local</code>, then restart the dev server.
          </p>
        </div>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
