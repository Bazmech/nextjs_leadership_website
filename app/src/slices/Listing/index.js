import { getCmsText } from "@/lib/cms-field";
import { getLinkLabel } from "@/lib/link-utils";
import ListingBlock from "@/components/organisms/ListingBlock/ListingBlock";

export default function Listing({ slice }) {
  const items = (slice.items || []).map((item) => ({
    title: getCmsText(item.title),
    image: item.image,
    linkField: item.link,
    linkLabel: getLinkLabel(item.link, getCmsText(item.title)),
  }));

  return (
    <div data-slice-type={slice._type}>
      <ListingBlock items={items} />
    </div>
  );
}
