import { asText } from "@prismicio/client";
import CheckListItem from "@/components/molecules/CheckListItem/CheckListItem";
import SectionHeader from "@/components/molecules/SectionHeader/SectionHeader";
import Section from "@/components/organisms/Section/Section";

export default function About({ slice }) {
  const { primary, items } = slice;

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
              {asText(primary.monogram) || "EL"}
            </span>
          </div>
        </div>
        <div>
          <SectionHeader
            eyebrow={primary.eyebrow ? asText(primary.eyebrow) : undefined}
            title={primary.heading ? asText(primary.heading) : undefined}
          />
          {primary.body_paragraph_1 ? (
            <p className="mt-6 leading-relaxed text-muted">
              {asText(primary.body_paragraph_1)}
            </p>
          ) : null}
          {primary.body_paragraph_2 ? (
            <p className="mt-4 leading-relaxed text-muted">
              {asText(primary.body_paragraph_2)}
            </p>
          ) : null}
          {items?.length > 0 ? (
            <ul className="mt-8 grid gap-3">
              {items.map((item, index) => (
                <CheckListItem key={`${asText(item.highlight)}-${index}`}>
                  {asText(item.highlight)}
                </CheckListItem>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
