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
  const imageClass = reversed
    ? "col-span-12 md:col-span-6 md:col-start-7"
    : "col-span-12 md:col-span-6";
  const textClass = reversed
    ? "col-span-12 md:col-span-6 md:col-start-1 md:row-start-1"
    : "col-span-12 md:col-span-6";

  return (
    <>
      <div className={`${imageClass} ${className}`.trim()}>
        <AspectMedia
          image={image}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          videoUrl={videoUrl}
        />
      </div>
      <div className={textClass}>
        <RichText field={text} />
      </div>
    </>
  );
}
