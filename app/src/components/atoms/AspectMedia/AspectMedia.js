import Image from "next/image";
import { getImageAlt, getImageUrl, isSanityImage } from "@/sanity/lib/image";

export default function AspectMedia({
  image,
  imageSrc,
  imageAlt = "",
  videoUrl,
  className = "",
}) {
  const sanitySrc = isSanityImage(image) ? getImageUrl(image) : null;
  const resolvedSrc = sanitySrc || imageSrc;
  const alt = getImageAlt(image, imageAlt);

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
      {!videoUrl && resolvedSrc ? (
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 48rem, 100vw"
        />
      ) : null}
    </div>
  );
}
