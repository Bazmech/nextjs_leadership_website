import Eyebrow from "@/components/atoms/Eyebrow/Eyebrow";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  className = "",
  titleClassName = "",
}) {
  return (
    <div className={className}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {title ? (
        <h2
          className={`mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl ${titleClassName}`.trim()}
        >
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="mt-4 text-lg text-muted">{description}</p>
      ) : null}
    </div>
  );
}
