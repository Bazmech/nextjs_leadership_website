import RichText from "@/components/molecules/RichText/RichText";
import Section from "@/components/organisms/Section/Section";

export default function RichTextBlock({ id, text, className = "py-24" }) {
  if (!text) return null;

  return (
    <Section id={id} className={className}>
      <div className="col-span-12 md:col-span-8">
        <RichText field={text} />
      </div>
    </Section>
  );
}
