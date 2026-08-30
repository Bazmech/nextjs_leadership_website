import SectionHeader from "@/components/molecules/SectionHeader/SectionHeader";
import ServiceCard from "@/components/molecules/ServiceCard/ServiceCard";
import Section from "@/components/organisms/Section/Section";

const services = [
  {
    title: "Executive Coaching",
    description:
      "One-on-one coaching for C-suite and senior leaders to sharpen decision-making, communication, and strategic vision.",
    icon: "◆",
  },
  {
    title: "Team Development",
    description:
      "Workshops and programs that strengthen collaboration, trust, and accountability across your organization.",
    icon: "◇",
  },
  {
    title: "Leadership Workshops",
    description:
      "Interactive sessions on emotional intelligence, conflict resolution, and leading through uncertainty.",
    icon: "○",
  },
  {
    title: "Organizational Strategy",
    description:
      "Advisory support for culture transformation, succession planning, and building leadership pipelines.",
    icon: "□",
  },
];

export default function Services() {
  return (
    <Section id="services" className="bg-surface py-24">
      <SectionHeader
        className="max-w-2xl"
        eyebrow="What We Offer"
        title="Programs designed for lasting impact"
        description="Tailored solutions that meet leaders where they are and accelerate where they want to go."
      />
      <div className="mt-14 grid gap-8 sm:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </Section>
  );
}
