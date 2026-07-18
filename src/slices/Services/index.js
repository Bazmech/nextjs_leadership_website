import { getPrismicText } from "@/lib/prismic-field";
import SectionHeader from "@/components/molecules/SectionHeader/SectionHeader";
import ServiceCard from "@/components/molecules/ServiceCard/ServiceCard";
import Section from "@/components/organisms/Section/Section";

export default function Services({ slice }) {
  const { primary, items } = slice;
  const eyebrow = getPrismicText(primary.eyebrow);
  const heading = getPrismicText(primary.heading);
  const description = getPrismicText(primary.description);

  return (
    <Section
      id="services"
      className="bg-surface py-24"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <SectionHeader
        className="max-w-2xl"
        eyebrow={eyebrow || undefined}
        title={heading || undefined}
        description={description || undefined}
      />
      {items?.length > 0 ? (
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {items.map((item, index) => {
            const title = getPrismicText(item.title);
            return (
              <ServiceCard
                key={`${title}-${index}`}
                icon={getPrismicText(item.icon, "◆")}
                title={title}
                description={getPrismicText(item.description)}
              />
            );
          })}
        </div>
      ) : null}
    </Section>
  );
}
