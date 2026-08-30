import { defineType } from "sanity";
import { navMenuItemsField } from "../objects/navMenuItems";

export const headerMenu = defineType({
  name: "headerMenu",
  title: "Header menu",
  type: "document",
  fields: [navMenuItemsField],
  preview: {
    prepare() {
      return { title: "Header menu" };
    },
  },
});
