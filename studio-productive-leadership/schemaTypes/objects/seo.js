import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO & metadata",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "SEO title",
      type: "string",
    }),
    defineField({
      name: "metaDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "metaImage",
      title: "Social sharing image",
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
      name: "ogTitle",
      title: "Open Graph title",
      type: "string",
    }),
    defineField({
      name: "ogDescription",
      title: "Open Graph description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "url",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
