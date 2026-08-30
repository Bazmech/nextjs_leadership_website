import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

export default defineConfig({
  name: "productive-leadership",
  title: "Productive Leadership",
  projectId: "vrub9uq4",
  dataset: "production",
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: "2026-08-30" }),
  ],
  schema: { types: schemaTypes },
});
