import { defineArrayMember, defineField } from "sanity";

export const pageBuilderField = defineField({
  name: "slices",
  title: "Page content",
  type: "array",
  of: [
    defineArrayMember({ type: "hero" }),
    defineArrayMember({ type: "about" }),
    defineArrayMember({ type: "media" }),
    defineArrayMember({ type: "textImage" }),
    defineArrayMember({ type: "listing" }),
    defineArrayMember({ type: "sectionIntro" }),
    defineArrayMember({ type: "richText" }),
  ],
});
