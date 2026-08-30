import { getCmsText } from "@/lib/cms-field";
import { getLinkLabel, resolveLinkHref } from "@/lib/link-utils";
import Button from "@/components/atoms/Button/Button";
import Container from "@/components/atoms/Container/Container";
import Eyebrow from "@/components/atoms/Eyebrow/Eyebrow";
import Link from "@/components/atoms/Link/Link";
import StatCard from "@/components/molecules/StatCard/StatCard";

export default function Hero({ slice }) {
  const eyebrow = getCmsText(slice.eyebrow);
  const title = getCmsText(slice.title);
  const description = getCmsText(slice.description);
  const stats = Array.isArray(slice.stats) ? slice.stats : [];

  return (
    <section
      data-slice-type={slice._type}
      className="relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <Container>
        {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
        {title ? (
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            {title}
          </h1>
        ) : null}
        {description ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            {description}
          </p>
        ) : null}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:w-fit">
          <Link field={slice.primaryCta} href={resolveLinkHref(slice.primaryCta, "#services")}>
            <Button as="span" variant="accent">
              {getLinkLabel(slice.primaryCta, "Explore Services")}
            </Button>
          </Link>
          <Link field={slice.secondaryCta} href={resolveLinkHref(slice.secondaryCta, "#about")}>
            <Button as="span" variant="secondary">
              {getLinkLabel(slice.secondaryCta, "About Us")}
            </Button>
          </Link>
        </div>
        {stats.length > 0 ? (
          <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-10 md:grid-cols-4">
            {stats.map((item, index) => {
              const label = getCmsText(item.label);
              return (
                <StatCard
                  key={`${label}-${index}`}
                  value={getCmsText(item.value)}
                  label={label}
                />
              );
            })}
          </dl>
        ) : null}
      </Container>
    </section>
  );
}
