import { getPrismicText } from "@/lib/prismic-field";
import SectionIntroBlock from "@/components/organisms/SectionIntroBlock/SectionIntroBlock";

export default function SectionIntro({ slice }) {
  const { primary } = slice;

  return (
    <div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
      <SectionIntroBlock
        title={getPrismicText(primary.title)}
        subtitle={getPrismicText(primary.subtitle)}
        text={primary.text}
        linkField={primary.link}
        linkLabel={primary.link?.text}
      />
    </div>
  );
}
