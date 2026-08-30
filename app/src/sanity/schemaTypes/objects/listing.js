import { defineArrayMember, defineField, defineType } from "sanity";

export const listing = defineType({
  name: "listing",
  title: "Listing",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Cards",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
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
            defineField({ name: "link", title: "Link", type: "appLink" }),
          ],
          preview: {
            select: { title: "title", media: "image" },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare({ items }) {
      const count = items?.length || 0;
      return { title: "Listing", subtitle: `${count} card${count === 1 ? "" : "s"}` };
    },
  },
});
