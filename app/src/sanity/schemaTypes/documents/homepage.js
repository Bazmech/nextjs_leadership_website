import { defineField, defineType } from "sanity";
import { pageBuilderField } from "../objects/pageBuilder";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
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
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Homepage" };
    },
  },
});
