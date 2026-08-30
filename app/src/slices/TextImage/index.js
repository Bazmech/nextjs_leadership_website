import { getCmsText } from "@/lib/cms-field";
import TextImageBlock from "@/components/organisms/TextImageBlock/TextImageBlock";

export default function TextImage({ slice }) {
  return (
    <div data-slice-type={slice._type}>
      <TextImageBlock
        image={slice.image}
        videoUrl={getCmsText(slice.videoUrl) || undefined}
        text={slice.text}
        reversed={Boolean(slice.reversed)}
      />
    </div>
  );
}
