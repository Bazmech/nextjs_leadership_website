import { PrismicNextImage } from "@prismicio/next";

export default function AspectMedia({
  image,
  imageSrc,
  imageAlt = "",
  videoUrl,
  className = "",
}) {
  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-border ${className}`.trim()}
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          controls
          className="h-full w-full object-cover"
          playsInline
        />
      ) : null}
      {!videoUrl && image ? (
        <PrismicNextImage field={image} fill className="object-cover" alt="" />
      ) : null}
      {!videoUrl && !image && imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}
