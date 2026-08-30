import ListingBlock from "@/components/organisms/ListingBlock/ListingBlock";
import SectionIntroBlock from "@/components/organisms/SectionIntroBlock/SectionIntroBlock";

export default function RelatedArticles({
  heading = "Related articles",
  items = [],
}) {
  if (!items.length) return null;

  return (
    <>
      <SectionIntroBlock title={heading} className="pb-8 pt-24" />
      <ListingBlock items={items} className="pb-24 pt-0" />
    </>
  );
}
