import { defineField, defineType } from "sanity";
import { pageBuilderField } from "../objects/pageBuilder";

export const page = defineType({
  name: "page",
  title: "Page",
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
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) =>
        rule.required().custom((value) => {
          if (value?.current === "articles") {
            return "This path is reserved for the article listing";
          }
          return true;
        }),
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
    select: { title: "title", slug: "slug.current" },
    prepare({ title, slug }) {
      return { title: title || "Page", subtitle: slug ? `/${slug}` : "" };
    },
  },
});
