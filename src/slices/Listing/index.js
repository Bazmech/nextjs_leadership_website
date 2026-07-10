import { asText } from "@prismicio/client";
import ListingBlock from "@/components/organisms/ListingBlock/ListingBlock";

export default function Listing({ slice }) {
  const items = slice.items.map((item) => ({
    title: asText(item.title),
    image: item.image,
    linkField: item.link,
    linkLabel: item.link?.text,
  }));

  return (
    <div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
      <ListingBlock items={items} />
    </div>
  );
}
