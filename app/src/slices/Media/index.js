import { getCmsText } from "@/lib/cms-field";
import MediaBlock from "@/components/organisms/MediaBlock/MediaBlock";

export default function Media({ slice }) {
  return (
    <div data-slice-type={slice._type}>
      <MediaBlock
        image={slice.image}
        videoUrl={getCmsText(slice.videoUrl) || undefined}
      />
    </div>
  );
}
