import { defineField, defineType } from "sanity";

export const sectionIntro = defineType({
  name: "sectionIntro",
  title: "Section intro",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
    defineField({ name: "text", title: "Text", type: "portableText" }),
    defineField({ name: "link", title: "Link", type: "appLink" }),
  ],
  preview: {
    select: { title: "title", subtitle: "subtitle" },
    prepare({ title, subtitle }) {
      return { title: title || "Section intro", subtitle };
    },
  },
});
