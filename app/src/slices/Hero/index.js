import HeroBlock from "@/components/organisms/Hero/Hero";
import { getCmsText } from "@/lib/cms-field";

export default function Hero({ slice }) {
  return (
    <HeroBlock
      sliceType={slice._type}
      eyebrow={getCmsText(slice.eyebrow)}
      title={getCmsText(slice.title)}
      description={getCmsText(slice.description)}
      primaryCta={{ field: slice.primaryCta }}
      secondaryCta={{ field: slice.secondaryCta }}
      image={slice.image}
      stats={Array.isArray(slice.stats) ? slice.stats : []}
    />
  );
}
