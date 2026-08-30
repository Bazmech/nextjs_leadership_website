import { defineField, defineType } from "sanity";
import { pageBuilderField } from "../objects/pageBuilder";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "content", title: "Page content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({ ...pageBuilderField, group: "content" }),
    defineField({
      name: "seo",
      title: "SEO & metadata",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Homepage" };
    },
  },
});
