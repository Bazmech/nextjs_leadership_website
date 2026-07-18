import { getPrismicText } from "@/lib/prismic-field";
import TextImageBlock from "@/components/organisms/TextImageBlock/TextImageBlock";

export default function TextImage({ slice }) {
  const { primary } = slice;

  return (
    <div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
      <TextImageBlock
        image={primary.image}
        videoUrl={getPrismicText(primary.video_url) || undefined}
        text={primary.text}
        reversed={primary.reversed}
      />
    </div>
  );
}
