import { asText } from "@prismicio/client";
import SectionHeader from "@/components/molecules/SectionHeader/SectionHeader";
import ServiceCard from "@/components/molecules/ServiceCard/ServiceCard";
import Section from "@/components/organisms/Section/Section";

export default function Services({ slice }) {
  const { primary, items } = slice;

  return (
    <Section
      id="services"
      className="bg-surface py-24"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
        <SectionHeader
          className="max-w-2xl"
          eyebrow={primary.eyebrow ? asText(primary.eyebrow) : undefined}
          title={primary.heading ? asText(primary.heading) : undefined}
          description={
            primary.description ? asText(primary.description) : undefined
          }
        />
        {items?.length > 0 ? (
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {items.map((item, index) => (
              <ServiceCard
                key={`${asText(item.title)}-${index}`}
                icon={asText(item.icon) || "◆"}
                title={asText(item.title)}
                description={asText(item.description)}
              />
            ))}
          </div>
        ) : null}
    </Section>
  );
}
