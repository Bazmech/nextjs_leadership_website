import SectionIntro from "@/components/molecules/SectionIntro/SectionIntro";
import Section from "@/components/organisms/Section/Section";

export default function SectionIntroBlock({
  id,
  title,
  subtitle,
  text,
  linkHref,
  linkField,
  linkLabel,
  linkTarget,
  className = "py-24",
}) {
  return (
    <Section id={id} className={className}>
      <SectionIntro
        title={title}
        subtitle={subtitle}
        text={text}
        linkHref={linkHref}
        linkField={linkField}
        linkLabel={linkLabel}
        linkTarget={linkTarget}
      />
    </Section>
  );
}
