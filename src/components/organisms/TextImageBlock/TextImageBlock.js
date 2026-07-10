import TextImage from "@/components/molecules/TextImage/TextImage";
import Section from "@/components/organisms/Section/Section";

export default function TextImageBlock({
  id,
  image,
  imageSrc,
  imageAlt,
  videoUrl,
  text,
  reversed = false,
  className = "py-24",
}) {
  return (
    <Section id={id} className={className}>
      <TextImage
        image={image}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        videoUrl={videoUrl}
        text={text}
        reversed={reversed}
      />
    </Section>
  );
}
