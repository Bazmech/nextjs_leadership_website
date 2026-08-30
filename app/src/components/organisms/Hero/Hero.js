import Image from "next/image";
import Button from "@/components/atoms/Button/Button";
import Eyebrow from "@/components/atoms/Eyebrow/Eyebrow";
import Link from "@/components/atoms/Link/Link";
import StatCard from "@/components/molecules/StatCard/StatCard";
import Section from "@/components/organisms/Section/Section";
import { getCmsText } from "@/lib/cms-field";
import { getLinkLabel, resolveLinkHref } from "@/lib/link-utils";
import { getImageAlt, getImageUrl } from "@/sanity/lib/image";

const defaultStats = [
  { value: "15+", label: "Years Experience" },
  { value: "200+", label: "Leaders Coached" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "40+", label: "Organizations Served" },
];

function getCta(cta) {
  if (!cta) return null;
  const href = resolveLinkHref(cta.field, cta.href);
  const label = getLinkLabel(cta.field, cta.label || "");
  if (!href || !label) return null;
  return { field: cta.field, href, label };
}

function HeroCta({ cta, variant }) {
  const resolved = getCta(cta);
  if (!resolved) return null;

  return (
    <Link field={resolved.field} href={resolved.href}>
      <Button as="span" variant={variant}>
        {resolved.label}
      </Button>
    </Link>
  );
}

export default function Hero({
  eyebrow = "Executive Coaching & Leadership Development",
  title = "Lead with clarity, confidence, and purpose",
  description = "We partner with executives and emerging leaders to build high-performing teams, navigate change, and unlock their full potential.",
  primaryCta = { href: "#services", label: "Explore Services" },
  secondaryCta = { href: "#about", label: "About Us" },
  image,
  imageSrc,
  imageAlt = "",
  stats = defaultStats,
  sliceType,
}) {
  const resolvedImageSrc = getImageUrl(image) || imageSrc;
  const resolvedImageAlt = getImageAlt(image, imageAlt);
  const resolvedStats = Array.isArray(stats) ? stats : [];
  const outlineCta = getCta(secondaryCta);
  const solidCta = getCta(primaryCta);
  const copySpan = resolvedImageSrc
    ? "col-span-12 md:col-span-6"
    : "col-span-12 md:col-span-8";

  return (
    <Section
      data-slice-type={sliceType}
      className="py-24 md:py-32"
      containerClassName={resolvedImageSrc ? "items-center" : undefined}
    >
      <div className={copySpan}>
        {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
        {title ? (
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {title}
          </h1>
        ) : null}
        {description ? (
          <p className="mt-6 text-lg leading-relaxed text-muted md:text-xl">
            {description}
          </p>
        ) : null}
        {outlineCta || solidCta ? (
          <div className="mt-10 flex flex-wrap gap-4">
            <HeroCta cta={secondaryCta} variant="secondary" />
            <HeroCta cta={primaryCta} variant="accent" />
          </div>
        ) : null}
      </div>
      {resolvedImageSrc ? (
        <div className="relative col-span-12 aspect-square md:col-span-6">
          <Image
            src={resolvedImageSrc}
            alt={resolvedImageAlt}
            fill
            priority
            className="object-contain"
            sizes="(min-width: 768px) 28rem, 80vw"
          />
        </div>
      ) : null}
      {resolvedStats.length > 0 ? (
        <dl className="col-span-12 grid grid-cols-12 gap-x-4 gap-y-8 border-t border-border pt-10 md:gap-x-6">
          {resolvedStats.map((item, index) => {
            const label = getCmsText(item.label);
            return (
              <StatCard
                key={`${label}-${index}`}
                className="col-span-6 md:col-span-3"
                value={getCmsText(item.value)}
                label={label}
              />
            );
          })}
        </dl>
      ) : null}
    </Section>
  );
}
