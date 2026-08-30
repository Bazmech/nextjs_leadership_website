import { defineType } from "sanity";
import { navMenuItemsField } from "../objects/navMenuItems";

export const footerMenu = defineType({
  name: "footerMenu",
  title: "Footer menu",
  type: "document",
  fields: [navMenuItemsField],
  preview: {
    prepare() {
      return { title: "Footer menu" };
    },
  },
});
