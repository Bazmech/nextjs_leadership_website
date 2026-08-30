import { defineField, defineType } from "sanity";

export const richText = defineType({
  name: "richText",
  title: "Rich text",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "portableText",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Rich text" };
    },
  },
});
