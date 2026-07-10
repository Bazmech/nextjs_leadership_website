import { asText } from "@prismicio/client";
import TextImageBlock from "@/components/organisms/TextImageBlock/TextImageBlock";

export default function TextImage({ slice }) {
  const { primary } = slice;

  return (
    <div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
      <TextImageBlock
        image={primary.image}
        videoUrl={asText(primary.video_url)}
        text={primary.text}
        reversed={primary.reversed}
      />
    </div>
  );
}
