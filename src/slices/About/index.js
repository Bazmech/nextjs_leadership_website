import { getPrismicText } from "@/lib/prismic-field";
import CheckListItem from "@/components/molecules/CheckListItem/CheckListItem";
import SectionHeader from "@/components/molecules/SectionHeader/SectionHeader";
import Section from "@/components/organisms/Section/Section";

export default function About({ slice }) {
  const { primary, items } = slice;
  const eyebrow = getPrismicText(primary.eyebrow);
  const heading = getPrismicText(primary.heading);
  const body1 = getPrismicText(primary.body_paragraph_1);
  const body2 = getPrismicText(primary.body_paragraph_2);

  return (
    <Section
      id="about"
      className="py-24"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="relative aspect-square max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-light">
          <div className="grid h-full place-items-center">
            <span className="text-8xl font-bold text-white/20" aria-hidden="true">
              {getPrismicText(primary.monogram, "PL")}
            </span>
          </div>
        </div>
        <div>
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
          {items?.length > 0 ? (
            <ul className="mt-8 grid gap-3">
              {items.map((item, index) => {
                const highlight = getPrismicText(item.highlight);
                return (
                  <CheckListItem key={`${highlight}-${index}`}>
                    {highlight}
                  </CheckListItem>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
