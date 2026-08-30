import { defineField, defineType } from "sanity";

export const about = defineType({
  name: "about",
  title: "About",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "bodyParagraph1",
      title: "Body paragraph 1",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "bodyParagraph2",
      title: "Body paragraph 2",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "monogram",
      title: "Monogram",
      type: "string",
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
    prepare({ title, subtitle }) {
      return { title: title || "About", subtitle };
    },
  },
});
