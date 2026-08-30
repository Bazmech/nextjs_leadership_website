import { defineArrayMember, defineField, defineType } from "sanity";

export const headerMenu = defineType({
  name: "headerMenu",
  title: "Header menu",
  type: "document",
  fields: [
    defineField({
      name: "menuItems",
      title: "Menu items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "link",
              title: "Link",
              type: "appLink",
            }),
            defineField({
              name: "requiredRole",
              title: "Minimum role",
              type: "string",
              options: {
                list: [
                  { title: "Public", value: "public" },
                  { title: "default", value: "default" },
                  { title: "admin", value: "admin" },
                  { title: "super_admin", value: "super_admin" },
                ],
                layout: "radio",
              },
              initialValue: "public",
            }),
            defineField({
              name: "parentLabel",
              title: "Parent label",
              type: "string",
              description:
                "Leave blank for top-level. Enter a parent item's Label to nest this item.",
            }),
          ],
          preview: {
            select: { title: "label", role: "requiredRole" },
            prepare({ title, role }) {
              return { title: title || "Menu item", subtitle: role };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Header menu" };
    },
  },
});
