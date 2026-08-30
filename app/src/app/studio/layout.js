import { NextStudioLayout } from "next-sanity/studio";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioLayout({ children }) {
  return <NextStudioLayout>{children}</NextStudioLayout>;
}
