import { defineArrayMember, defineField, defineType } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "Optional. Shown beside the text on desktop.",
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
      name: "primaryCta",
      title: "Primary CTA",
      type: "appLink",
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary CTA",
      type: "appLink",
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "eyebrow", media: "image" },
    prepare({ title, subtitle, media }) {
      return { title: title || "Hero", subtitle, media };
    },
  },
});
