import { getCmsText } from "@/lib/cms-field";
import CheckListItem from "@/components/molecules/CheckListItem/CheckListItem";
import SectionHeader from "@/components/molecules/SectionHeader/SectionHeader";
import Section from "@/components/organisms/Section/Section";

export default function About({ slice }) {
  const eyebrow = getCmsText(slice.eyebrow);
  const heading = getCmsText(slice.heading);
  const body1 = getCmsText(slice.bodyParagraph1);
  const body2 = getCmsText(slice.bodyParagraph2);
  const highlights = Array.isArray(slice.highlights) ? slice.highlights : [];

  return (
    <Section id="about" className="py-24" data-slice-type={slice._type}>
      <div className="relative col-span-12 aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-light md:col-span-6">
        <div className="grid h-full place-items-center">
          <span className="text-8xl font-bold text-white/20" aria-hidden="true">
            {getCmsText(slice.monogram, "PL")}
          </span>
        </div>
      </div>
      <div className="col-span-12 md:col-span-6">
        <SectionHeader
          eyebrow={eyebrow || undefined}
          title={heading || undefined}
        />
        {body1 ? (
          <p className="mt-6 leading-relaxed text-muted">{body1}</p>
        ) : null}
        {body2 ? (
          <p className="mt-4 leading-relaxed text-muted">{body2}</p>
        ) : null}
        {highlights.length > 0 ? (
          <ul className="mt-8 grid gap-3">
            {highlights.map((highlight, index) => (
              <CheckListItem key={`${highlight}-${index}`}>
                {highlight}
              </CheckListItem>
            ))}
          </ul>
        ) : null}
      </div>
    </Section>
  );
}
