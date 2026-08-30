import { defineField, defineType } from "sanity";

export const textImage = defineType({
  name: "textImage",
  title: "Text and image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
        }),
      ],
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "Optional. Overrides the image when set.",
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "portableText",
    }),
    defineField({
      name: "reversed",
      title: "Reverse layout on desktop",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { media: "image" },
    prepare({ media }) {
      return { title: "Text and image", media };
    },
  },
});
