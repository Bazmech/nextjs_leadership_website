import AspectMedia from "@/components/atoms/AspectMedia/AspectMedia";
import Section from "@/components/organisms/Section/Section";

export default function MediaBlock({
  id,
  image,
  imageSrc,
  imageAlt,
  videoUrl,
  className = "py-16",
}) {
  return (
    <Section id={id} className={className}>
      <AspectMedia
        image={image}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        videoUrl={videoUrl}
      />
    </Section>
  );
}
