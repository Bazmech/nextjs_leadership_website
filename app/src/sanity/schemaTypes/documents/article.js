import { defineArrayMember, defineField, defineType } from "sanity";
import { pageBuilderField } from "../objects/pageBuilder";

export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  groups: [
    { name: "content", title: "Article content", default: true },
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
      description: "Short summary shown on the article listing and cards.",
    }),
    defineField({
      name: "featuredImage",
      title: "Featured image",
      type: "image",
      group: "content",
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
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "protected",
      title: "Protected",
      type: "boolean",
      group: "content",
      description:
        "Only signed-in users can read this article. Unsigned visitors see a padlock in listings and cannot open it.",
      initialValue: false,
      options: { layout: "checkbox" },
    }),
    defineField({ ...pageBuilderField, group: "content" }),
    defineField({
      name: "relatedArticles",
      title: "Related articles",
      type: "array",
      group: "content",
      description:
        "Shown at the bottom of the article page. If empty, the latest other articles are used.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "article" }],
        }),
      ],
      validation: (rule) => rule.max(3).unique(),
    }),
    defineField({
      name: "seo",
      title: "SEO & metadata",
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    {
      title: "Published date, newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      isProtected: "protected",
      media: "featuredImage",
    },
    prepare({ title, slug, isProtected, media }) {
      const access = isProtected ? "Protected" : "Public";
      const path = slug ? `/articles/${slug}` : "";
      return {
        title: title || "Article",
        subtitle: [access, path].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
