import { defineField, defineType } from "sanity";

export const cookiebotCookieListing = defineType({
  name: "cookiebotCookieListing",
  title: "Cookiebot cookie listing",
  type: "object",
  description:
    "Renders Cookiebot’s cookie declaration at this position. Place it on the cookie or privacy policy page.",
  fields: [
    defineField({
      name: "enabled",
      type: "boolean",
      hidden: true,
      initialValue: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Cookiebot cookie listing",
        subtitle: "Cookie declaration",
      };
    },
  },
});
