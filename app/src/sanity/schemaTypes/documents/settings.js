import { defineArrayMember, defineField, defineType } from "sanity";

export const settings = defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  groups: [
    { name: "identity", title: "Site identity", default: true },
    { name: "seo", title: "SEO fallbacks" },
    { name: "contact", title: "Contact & header" },
    { name: "social", title: "Social" },
    { name: "access", title: "Account access" },
  ],
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "titlePostfix",
      title: "Title postfix",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "logoLabel",
      title: "Logo text",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "logoAccent",
      title: "Logo accent text",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "defaultMetaTitle",
      title: "Default SEO title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "defaultMetaDescription",
      title: "Default SEO description",
      type: "text",
      rows: 3,
      group: "seo",
    }),
    defineField({
      name: "defaultMetaImage",
      title: "Default social sharing image",
      type: "image",
      group: "seo",
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
      name: "defaultOgTitle",
      title: "Default Open Graph title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "defaultOgDescription",
      title: "Default Open Graph description",
      type: "text",
      rows: 3,
      group: "seo",
    }),
    defineField({
      name: "siteUrl",
      title: "Site URL",
      type: "url",
      group: "seo",
    }),
    defineField({
      name: "twitterHandle",
      title: "Twitter / X handle",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "googleSiteVerification",
      title: "Google site verification",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact phone",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "headerCta",
      title: "Header CTA",
      type: "appLink",
      group: "contact",
    }),
    defineField({
      name: "footerCopyright",
      title: "Footer copyright name",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      group: "social",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  "LinkedIn",
                  "Twitter",
                  "Facebook",
                  "Instagram",
                  "YouTube",
                  "Other",
                ],
              },
            }),
            defineField({
              name: "href",
              title: "URL",
              type: "url",
            }),
          ],
          preview: {
            select: { title: "platform", subtitle: "href" },
          },
        }),
      ],
    }),
    defineField({
      name: "accountDisabledPage",
      title: "Account disabled page",
      type: "reference",
      to: [{ type: "page" }],
      group: "access",
    }),
    defineField({
      name: "introductionText",
      title: "Dashboard introduction text",
      type: "portableText",
      group: "access",
    }),
  ],
  preview: {
    select: { title: "siteName" },
    prepare({ title }) {
      return { title: title || "Settings" };
    },
  },
});
