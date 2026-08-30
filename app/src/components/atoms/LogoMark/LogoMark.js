import Image from "next/image";

export default function LogoMark({
  alt = "",
  className = "size-11",
  priority = false,
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-surface p-2 ${className}`.trim()}
    >
      <Image
        src="/logo.png"
        alt={alt}
        width={810}
        height={748}
        priority={priority}
        className="max-h-full max-w-full object-contain"
      />
    </span>
  );
}
