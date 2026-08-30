import { defineField, defineType } from "sanity";
import { pageBuilderField } from "../objects/pageBuilder";

export const articleListing = defineType({
  name: "articleListing",
  title: "Article listing",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "content",
      description: "Shown under the title when this page has no page-builder slices.",
    }),
    defineField({
      name: "relatedHeading",
      title: "Related articles heading",
      type: "string",
      group: "content",
      description: "Heading for the related articles section on each article page.",
      initialValue: "Related articles",
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
      return { title: title || "Article listing", subtitle: "/articles" };
    },
  },
});
