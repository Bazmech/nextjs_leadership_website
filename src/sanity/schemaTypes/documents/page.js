import { defineField, defineType } from "sanity";
import { pageBuilderField } from "../objects/pageBuilder";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    pageBuilderField,
    defineField({
      name: "seo",
      title: "SEO & metadata",
      type: "seo",
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare({ title, slug }) {
      return { title: title || "Page", subtitle: slug ? `/${slug}` : "" };
    },
  },
});
