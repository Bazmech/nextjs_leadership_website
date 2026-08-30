import { defineField, defineType } from "sanity";

export const appLink = defineType({
  name: "appLink",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
    }),
    defineField({
      name: "href",
      title: "URL or path",
      type: "string",
      description: "External URL, site path (/about), or hash (#services)",
    }),
    defineField({
      name: "internalPage",
      title: "Internal page",
      type: "reference",
      to: [{ type: "page" }, { type: "article" }],
      description: "Overrides URL or path when set",
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in new tab",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "label",
      href: "href",
      slug: "internalPage.slug.current",
      type: "internalPage._type",
    },
    prepare({ title, href, slug, type }) {
      const path = slug
        ? type === "article"
          ? `/articles/${slug}`
          : `/${slug}`
        : href;
      return {
        title: title || slug || href || "Link",
        subtitle: path,
      };
    },
  },
});
