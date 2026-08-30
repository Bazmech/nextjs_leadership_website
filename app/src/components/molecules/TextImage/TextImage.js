import AspectMedia from "@/components/atoms/AspectMedia/AspectMedia";
import RichText from "@/components/molecules/RichText/RichText";

export default function TextImage({
  image,
  imageSrc,
  imageAlt,
  videoUrl,
  text,
  reversed = false,
  className = "",
}) {
  return (
    <div
      className={`grid grid-cols-1 items-center gap-12 md:grid-cols-2 ${className}`.trim()}
    >
      <div className={reversed ? "order-1 md:order-2" : "order-1"}>
        <AspectMedia
          image={image}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          videoUrl={videoUrl}
        />
      </div>
      <div className={reversed ? "order-2 md:order-1" : "order-2"}>
        <RichText field={text} />
      </div>
    </div>
  );
}
