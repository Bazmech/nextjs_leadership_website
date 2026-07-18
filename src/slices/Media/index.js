import { getPrismicText } from "@/lib/prismic-field";
import MediaBlock from "@/components/organisms/MediaBlock/MediaBlock";

export default function Media({ slice }) {
  const { primary } = slice;

  return (
    <div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
      <MediaBlock
        image={primary.image}
        videoUrl={getPrismicText(primary.video_url) || undefined}
      />
    </div>
  );
}
