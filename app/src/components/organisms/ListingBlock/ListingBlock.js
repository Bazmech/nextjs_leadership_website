import ListingCard from "@/components/molecules/ListingCard/ListingCard";
import Section from "@/components/organisms/Section/Section";

export default function ListingBlock({ id, items = [], className = "py-24" }) {
  if (!items.length) return null;

  return (
    <Section id={id} className={className}>
      {items.map((item, index) => (
        <ListingCard
          key={`${item.title}-${index}`}
          className="col-span-12 sm:col-span-6 lg:col-span-4"
          {...item}
        />
      ))}
    </Section>
  );
}
