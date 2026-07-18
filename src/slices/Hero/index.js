import { getPrismicText } from "@/lib/prismic-field";
import { PrismicNextLink } from "@prismicio/next";
import Button from "@/components/atoms/Button/Button";
import Container from "@/components/atoms/Container/Container";
import Eyebrow from "@/components/atoms/Eyebrow/Eyebrow";
import StatCard from "@/components/molecules/StatCard/StatCard";

function linkHref(field, fallback) {
  if (field?.link_type === "Web" && field.url) return field.url;
  if (field?.link_type === "Document" && field.url) return field.url;
  return fallback;
}

export default function Hero({ slice }) {
  const { primary, items } = slice;
  const eyebrow = getPrismicText(primary.eyebrow);
  const title = getPrismicText(primary.title);
  const description = getPrismicText(primary.description);

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
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
          <PrismicNextLink
            field={primary.primary_cta_link}
            href={linkHref(primary.primary_cta_link, "#services")}
          >
            <Button as="span" variant="accent">
              {getPrismicText(primary.primary_cta_label, "Explore Services")}
            </Button>
          </PrismicNextLink>
          <PrismicNextLink
            field={primary.secondary_cta_link}
            href={linkHref(primary.secondary_cta_link, "#about")}
          >
            <Button as="span" variant="secondary">
              {getPrismicText(primary.secondary_cta_label, "About Us")}
            </Button>
          </PrismicNextLink>
        </div>
        {items?.length > 0 ? (
          <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-10 md:grid-cols-4">
            {items.map((item, index) => {
              const label = getPrismicText(item.label);
              return (
                <StatCard
                  key={`${label}-${index}`}
                  value={getPrismicText(item.value)}
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
