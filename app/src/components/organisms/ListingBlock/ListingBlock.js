import ListingCard from "@/components/molecules/ListingCard/ListingCard";
import Section from "@/components/organisms/Section/Section";

export default function ListingBlock({ id, items = [], className = "py-24" }) {
  if (!items.length) return null;

  return (
    <Section id={id} className={className}>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <ListingCard key={`${item.title}-${index}`} {...item} />
        ))}
      </div>
    </Section>
  );
}
