import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

/**
 * Item in *Header Menu → Menu items*
 */
export interface HeaderMenuDocumentDataMenuItemsItem {
	/**
	 * Label field in *Header Menu → Menu items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Services
	 * - **API ID Path**: header_menu.menu_items[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * Link field in *Header Menu → Menu items*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: header_menu.menu_items[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Minimum role field in *Header Menu → Menu items*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Who can see this item
	 * - **Default Value**: Public
	 * - **API ID Path**: header_menu.menu_items[].required_role
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	required_role: prismic.SelectField<"Public" | "default" | "admin" | "super_admin", "filled">;
	
	/**
	 * Parent label (optional) field in *Header Menu → Menu items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave blank for top-level; enter a parent item's Label to nest
	 * - **API ID Path**: header_menu.menu_items[].parent_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	parent_label: prismic.KeyTextField;
}

/**
 * Content for Header Menu documents
 */
interface HeaderMenuDocumentData {
	/**
	 * Menu items field in *Header Menu*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: header_menu.menu_items[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	menu_items: prismic.GroupField<Simplify<HeaderMenuDocumentDataMenuItemsItem>>;
}

/**
 * Header Menu document from Prismic
 *
 * - **API ID**: `header_menu`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type HeaderMenuDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<HeaderMenuDocumentData>, "header_menu", Lang>;

type HomepageDocumentDataSlicesSlice = HeroSlice | ServicesSlice | AboutSlice | MediaSlice | TextImageSlice | ListingSlice | SectionIntroSlice | RichTextSlice

/**
 * Content for Homepage documents
 */
interface HomepageDocumentData {
	/**
	 * Title field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Homepage
	 * - **API ID Path**: homepage.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Page content field in *Homepage*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: homepage.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<HomepageDocumentDataSlicesSlice>;/**
	 * SEO title field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: ProductiveLeadership | Executive Coaching
	 * - **API ID Path**: homepage.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * SEO description field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Executive coaching and leadership development
	 * - **API ID Path**: homepage.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Social sharing image (Open Graph) field in *Homepage*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: homepage.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
	
	/**
	 * Open Graph title field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Defaults to SEO title when empty
	 * - **API ID Path**: homepage.og_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	og_title: prismic.KeyTextField;
	
	/**
	 * Open Graph description field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Defaults to SEO description when empty
	 * - **API ID Path**: homepage.og_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	og_description: prismic.KeyTextField;
	
	/**
	 * Canonical URL field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: https://www.example.com/ (optional)
	 * - **API ID Path**: homepage.canonical_url
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	canonical_url: prismic.KeyTextField;
	
	/**
	 * No index field in *Homepage*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: homepage.no_index
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	no_index: prismic.BooleanField;
}

/**
 * Homepage document from Prismic
 *
 * - **API ID**: `homepage`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type HomepageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<HomepageDocumentData>, "homepage", Lang>;

type PageDocumentDataSlicesSlice = HeroSlice | ServicesSlice | AboutSlice | MediaSlice | TextImageSlice | ListingSlice | SectionIntroSlice | RichTextSlice

/**
 * Content for Page documents
 */
interface PageDocumentData {
	/**
	 * Title field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Page title
	 * - **API ID Path**: page.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Page content field in *Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<PageDocumentDataSlicesSlice>;/**
	 * SEO title field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Defaults to page title when empty
	 * - **API ID Path**: page.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * SEO description field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Social sharing image (Open Graph) field in *Page*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
	
	/**
	 * Open Graph title field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Defaults to SEO title when empty
	 * - **API ID Path**: page.og_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	og_title: prismic.KeyTextField;
	
	/**
	 * Open Graph description field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Defaults to SEO description when empty
	 * - **API ID Path**: page.og_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	og_description: prismic.KeyTextField;
	
	/**
	 * Canonical URL field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: https://www.example.com/page-slug (optional)
	 * - **API ID Path**: page.canonical_url
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	canonical_url: prismic.KeyTextField;
	
	/**
	 * No index field in *Page*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: page.no_index
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	no_index: prismic.BooleanField;
}

/**
 * Page document from Prismic
 *
 * - **API ID**: `page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PageDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<PageDocumentData>, "page", Lang>;

/**
 * Item in *Settings → Social links*
 */
export interface SettingsDocumentDataSocialLinksItem {
	/**
	 * Platform field in *Settings → Social links*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.social_links[].platform
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	platform: prismic.SelectField<"LinkedIn" | "Twitter" | "Facebook" | "Instagram" | "YouTube" | "Other">;
	
	/**
	 * URL field in *Settings → Social links*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.social_links[].url
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	url: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Content for Settings documents
 */
interface SettingsDocumentData {
	/**
	 * Site name field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: ProductiveLeadership
	 * - **API ID Path**: settings.site_name
	 * - **Tab**: Site identity
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	site_name: prismic.KeyTextField;
	
	/**
	 * Title postfix field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**:  | ProductiveLeadership
	 * - **API ID Path**: settings.title_postfix
	 * - **Tab**: Site identity
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title_postfix: prismic.KeyTextField;
	
	/**
	 * Tagline field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Executive Coaching & Leadership Development
	 * - **API ID Path**: settings.tagline
	 * - **Tab**: Site identity
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	tagline: prismic.KeyTextField;
	
	/**
	 * Logo text field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: ProductiveLeadership
	 * - **API ID Path**: settings.logo_label
	 * - **Tab**: Site identity
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	logo_label: prismic.KeyTextField;
	
	/**
	 * Logo accent text field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leadership
	 * - **API ID Path**: settings.logo_accent
	 * - **Tab**: Site identity
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	logo_accent: prismic.KeyTextField;/**
	 * Default SEO title field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: ProductiveLeadership | Executive Coaching & Leadership Development
	 * - **API ID Path**: settings.default_meta_title
	 * - **Tab**: SEO fallbacks
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	default_meta_title: prismic.KeyTextField;
	
	/**
	 * Default SEO description field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Partner with experienced coaches to build high-performing teams...
	 * - **API ID Path**: settings.default_meta_description
	 * - **Tab**: SEO fallbacks
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	default_meta_description: prismic.KeyTextField;
	
	/**
	 * Default social sharing image field in *Settings*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.default_meta_image
	 * - **Tab**: SEO fallbacks
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	default_meta_image: prismic.ImageField<never>;
	
	/**
	 * Default Open Graph title field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Defaults to default SEO title when empty
	 * - **API ID Path**: settings.default_og_title
	 * - **Tab**: SEO fallbacks
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	default_og_title: prismic.KeyTextField;
	
	/**
	 * Default Open Graph description field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Defaults to default SEO description when empty
	 * - **API ID Path**: settings.default_og_description
	 * - **Tab**: SEO fallbacks
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	default_og_description: prismic.KeyTextField;
	
	/**
	 * Site URL field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: https://www.example.com
	 * - **API ID Path**: settings.site_url
	 * - **Tab**: SEO fallbacks
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	site_url: prismic.KeyTextField;
	
	/**
	 * Twitter / X handle field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: @productiveleadership
	 * - **API ID Path**: settings.twitter_handle
	 * - **Tab**: SEO fallbacks
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	twitter_handle: prismic.KeyTextField;
	
	/**
	 * Google site verification field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: verification token from Google Search Console
	 * - **API ID Path**: settings.google_site_verification
	 * - **Tab**: SEO fallbacks
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	google_site_verification: prismic.KeyTextField;/**
	 * Contact email field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: hello@example.com
	 * - **API ID Path**: settings.contact_email
	 * - **Tab**: Contact & header
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_email: prismic.KeyTextField;
	
	/**
	 * Contact phone field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: +1 (555) 123-4567
	 * - **API ID Path**: settings.contact_phone
	 * - **Tab**: Contact & header
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_phone: prismic.KeyTextField;
	
	/**
	 * Header CTA label field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Explore Services
	 * - **API ID Path**: settings.header_cta_label
	 * - **Tab**: Contact & header
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	header_cta_label: prismic.KeyTextField;
	
	/**
	 * Header CTA link field in *Settings*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.header_cta_link
	 * - **Tab**: Contact & header
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	header_cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Footer copyright name field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Defaults to site name when empty
	 * - **API ID Path**: settings.footer_copyright
	 * - **Tab**: Contact & header
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_copyright: prismic.KeyTextField;/**
	 * Social links field in *Settings*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.social_links[]
	 * - **Tab**: Social
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	social_links: prismic.GroupField<Simplify<SettingsDocumentDataSocialLinksItem>>;
}

/**
 * Settings document from Prismic
 *
 * - **API ID**: `settings`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SettingsDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<SettingsDocumentData>, "settings", Lang>;

export type AllDocumentTypes = HeaderMenuDocument | HomepageDocument | PageDocument | SettingsDocument;

/**
 * Primary content in *About → Default → Primary*
 */
export interface AboutSliceDefaultPrimary {
	/**
	 * Eyebrow field in *About → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: About Us
	 * - **API ID Path**: about.default.primary.eyebrow
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eyebrow: prismic.KeyTextField;
	
	/**
	 * Heading field in *About → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Trusted partners in leadership growth
	 * - **API ID Path**: about.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading: prismic.KeyTextField;
	
	/**
	 * Body Paragraph 1 field in *About → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: about.default.primary.body_paragraph_1
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_paragraph_1: prismic.KeyTextField;
	
	/**
	 * Body Paragraph 2 field in *About → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: about.default.primary.body_paragraph_2
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	body_paragraph_2: prismic.KeyTextField;
	
	/**
	 * Monogram field in *About → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: EL
	 * - **API ID Path**: about.default.primary.monogram
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	monogram: prismic.KeyTextField;
}

/**
 * Primary content in *About → Items*
 */
export interface AboutSliceDefaultItem {
	/**
	 * Highlight field in *About → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: about.items[].highlight
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	highlight: prismic.KeyTextField;
}

/**
 * Default variation for About Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default about layout
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type AboutSliceDefault = prismic.SharedSliceVariation<"default", Simplify<AboutSliceDefaultPrimary>, Simplify<AboutSliceDefaultItem>>;

/**
 * Slice variation for *About*
 */
type AboutSliceVariation = AboutSliceDefault

/**
 * About Shared Slice
 *
 * - **API ID**: `about`
 * - **Description**: About section with highlights
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type AboutSlice = prismic.SharedSlice<"about", AboutSliceVariation>;

/**
 * Primary content in *Hero → Default → Primary*
 */
export interface HeroSliceDefaultPrimary {
	/**
	 * Eyebrow field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Executive Coaching & Leadership Development
	 * - **API ID Path**: hero.default.primary.eyebrow
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eyebrow: prismic.KeyTextField;
	
	/**
	 * Title field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Lead with clarity, confidence, and purpose
	 * - **API ID Path**: hero.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Description field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: We partner with executives and emerging leaders...
	 * - **API ID Path**: hero.default.primary.description
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description: prismic.KeyTextField;
	
	/**
	 * Primary CTA Label field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Start Your Journey
	 * - **API ID Path**: hero.default.primary.primary_cta_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	primary_cta_label: prismic.KeyTextField;
	
	/**
	 * Primary CTA Link field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.default.primary.primary_cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	primary_cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Secondary CTA Label field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Explore Services
	 * - **API ID Path**: hero.default.primary.secondary_cta_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	secondary_cta_label: prismic.KeyTextField;
	
	/**
	 * Secondary CTA Link field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.default.primary.secondary_cta_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	secondary_cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Primary content in *Hero → Items*
 */
export interface HeroSliceDefaultItem {
	/**
	 * Stat Value field in *Hero → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 15+
	 * - **API ID Path**: hero.items[].value
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	value: prismic.KeyTextField;
	
	/**
	 * Stat Label field in *Hero → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Years Experience
	 * - **API ID Path**: hero.items[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
}

/**
 * Default variation for Hero Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default hero layout
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSliceDefault = prismic.SharedSliceVariation<"default", Simplify<HeroSliceDefaultPrimary>, Simplify<HeroSliceDefaultItem>>;

/**
 * Slice variation for *Hero*
 */
type HeroSliceVariation = HeroSliceDefault

/**
 * Hero Shared Slice
 *
 * - **API ID**: `hero`
 * - **Description**: Homepage hero with headline, CTAs, and stats
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSlice = prismic.SharedSlice<"hero", HeroSliceVariation>;

/**
 * Primary content in *Listing → Items*
 */
export interface ListingSliceDefaultItem {
	/**
	 * Image field in *Listing → Items*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: listing.items[].image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Title field in *Listing → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: listing.items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Link field in *Listing → Items*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: listing.items[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Default variation for Listing Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ListingSliceDefault = prismic.SharedSliceVariation<"default", Record<string, never>, Simplify<ListingSliceDefaultItem>>;

/**
 * Slice variation for *Listing*
 */
type ListingSliceVariation = ListingSliceDefault

/**
 * Listing Shared Slice
 *
 * - **API ID**: `listing`
 * - **Description**: Responsive 3-column card listing
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ListingSlice = prismic.SharedSlice<"listing", ListingSliceVariation>;

/**
 * Primary content in *Media → Default → Primary*
 */
export interface MediaSliceDefaultPrimary {
	/**
	 * Image field in *Media → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: media.default.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Video URL (optional) field in *Media → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: media.default.primary.video_url
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	video_url: prismic.KeyTextField;
}

/**
 * Default variation for Media Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type MediaSliceDefault = prismic.SharedSliceVariation<"default", Simplify<MediaSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Media*
 */
type MediaSliceVariation = MediaSliceDefault

/**
 * Media Shared Slice
 *
 * - **API ID**: `media`
 * - **Description**: 16:9 image or video
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type MediaSlice = prismic.SharedSlice<"media", MediaSliceVariation>;

/**
 * Primary content in *RichText → Default → Primary*
 */
export interface RichTextSliceDefaultPrimary {
	/**
	 * Text field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Rich text content
	 * - **API ID Path**: rich_text.default.primary.text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
}

/**
 * Default variation for RichText Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSliceDefault = prismic.SharedSliceVariation<"default", Simplify<RichTextSliceDefaultPrimary>, never>;

/**
 * Slice variation for *RichText*
 */
type RichTextSliceVariation = RichTextSliceDefault

/**
 * RichText Shared Slice
 *
 * - **API ID**: `rich_text`
 * - **Description**: Full-width rich text block
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSlice = prismic.SharedSlice<"rich_text", RichTextSliceVariation>;

/**
 * Primary content in *SectionIntro → Default → Primary*
 */
export interface SectionIntroSliceDefaultPrimary {
	/**
	 * Title field in *SectionIntro → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: section_intro.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Subtitle field in *SectionIntro → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: section_intro.default.primary.subtitle
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	subtitle: prismic.KeyTextField;
	
	/**
	 * Text field in *SectionIntro → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Optional rich text
	 * - **API ID Path**: section_intro.default.primary.text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * Link field in *SectionIntro → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: section_intro.default.primary.link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Default variation for SectionIntro Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type SectionIntroSliceDefault = prismic.SharedSliceVariation<"default", Simplify<SectionIntroSliceDefaultPrimary>, never>;

/**
 * Slice variation for *SectionIntro*
 */
type SectionIntroSliceVariation = SectionIntroSliceDefault

/**
 * SectionIntro Shared Slice
 *
 * - **API ID**: `section_intro`
 * - **Description**: Centered title, subtitle, text, and link
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type SectionIntroSlice = prismic.SharedSlice<"section_intro", SectionIntroSliceVariation>;

/**
 * Primary content in *Services → Default → Primary*
 */
export interface ServicesSliceDefaultPrimary {
	/**
	 * Eyebrow field in *Services → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: What We Offer
	 * - **API ID Path**: services.default.primary.eyebrow
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eyebrow: prismic.KeyTextField;
	
	/**
	 * Heading field in *Services → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Programs designed for lasting impact
	 * - **API ID Path**: services.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading: prismic.KeyTextField;
	
	/**
	 * Description field in *Services → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: services.default.primary.description
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description: prismic.KeyTextField;
}

/**
 * Primary content in *Services → Items*
 */
export interface ServicesSliceDefaultItem {
	/**
	 * Icon field in *Services → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: ◆
	 * - **API ID Path**: services.items[].icon
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	icon: prismic.KeyTextField;
	
	/**
	 * Title field in *Services → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Executive Coaching
	 * - **API ID Path**: services.items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Description field in *Services → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: services.items[].description
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description: prismic.KeyTextField;
}

/**
 * Default variation for Services Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default services layout
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ServicesSliceDefault = prismic.SharedSliceVariation<"default", Simplify<ServicesSliceDefaultPrimary>, Simplify<ServicesSliceDefaultItem>>;

/**
 * Slice variation for *Services*
 */
type ServicesSliceVariation = ServicesSliceDefault

/**
 * Services Shared Slice
 *
 * - **API ID**: `services`
 * - **Description**: Services grid section
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ServicesSlice = prismic.SharedSlice<"services", ServicesSliceVariation>;

/**
 * Primary content in *TextImage → Default → Primary*
 */
export interface TextImageSliceDefaultPrimary {
	/**
	 * Image field in *TextImage → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_image.default.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Video URL (optional, overrides image) field in *TextImage → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: text_image.default.primary.video_url
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	video_url: prismic.KeyTextField;
	
	/**
	 * Text field in *TextImage → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Rich text content
	 * - **API ID Path**: text_image.default.primary.text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * Reverse layout on desktop field in *TextImage → Default → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: text_image.default.primary.reversed
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	reversed: prismic.BooleanField;
}

/**
 * Default variation for TextImage Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TextImageSliceDefault = prismic.SharedSliceVariation<"default", Simplify<TextImageSliceDefaultPrimary>, never>;

/**
 * Slice variation for *TextImage*
 */
type TextImageSliceVariation = TextImageSliceDefault

/**
 * TextImage Shared Slice
 *
 * - **API ID**: `text_image`
 * - **Description**: 50/50 text and image with optional reverse
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TextImageSlice = prismic.SharedSlice<"text_image", TextImageSliceVariation>;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			HeaderMenuDocument,
			HeaderMenuDocumentData,
			HeaderMenuDocumentDataMenuItemsItem,
			HomepageDocument,
			HomepageDocumentData,
			HomepageDocumentDataSlicesSlice,
			PageDocument,
			PageDocumentData,
			PageDocumentDataSlicesSlice,
			SettingsDocument,
			SettingsDocumentData,
			SettingsDocumentDataSocialLinksItem,
			AllDocumentTypes,
			AboutSlice,
			AboutSliceDefaultPrimary,
			AboutSliceDefaultItem,
			AboutSliceVariation,
			AboutSliceDefault,
			HeroSlice,
			HeroSliceDefaultPrimary,
			HeroSliceDefaultItem,
			HeroSliceVariation,
			HeroSliceDefault,
			ListingSlice,
			ListingSliceDefaultItem,
			ListingSliceVariation,
			ListingSliceDefault,
			MediaSlice,
			MediaSliceDefaultPrimary,
			MediaSliceVariation,
			MediaSliceDefault,
			RichTextSlice,
			RichTextSliceDefaultPrimary,
			RichTextSliceVariation,
			RichTextSliceDefault,
			SectionIntroSlice,
			SectionIntroSliceDefaultPrimary,
			SectionIntroSliceVariation,
			SectionIntroSliceDefault,
			ServicesSlice,
			ServicesSliceDefaultPrimary,
			ServicesSliceDefaultItem,
			ServicesSliceVariation,
			ServicesSliceDefault,
			TextImageSlice,
			TextImageSliceDefaultPrimary,
			TextImageSliceVariation,
			TextImageSliceDefault
		}
	}
}