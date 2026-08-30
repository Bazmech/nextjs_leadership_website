import { getCmsText } from "@/lib/cms-field";
import { getLinkLabel } from "@/lib/link-utils";
import SectionIntroBlock from "@/components/organisms/SectionIntroBlock/SectionIntroBlock";

export default function SectionIntro({ slice }) {
  return (
    <div data-slice-type={slice._type}>
      <SectionIntroBlock
        title={getCmsText(slice.title)}
        subtitle={getCmsText(slice.subtitle)}
        text={slice.text}
        linkField={slice.link}
        linkLabel={getLinkLabel(slice.link)}
      />
    </div>
  );
}
