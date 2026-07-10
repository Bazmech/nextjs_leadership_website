import { asText } from "@prismicio/client";
import Container from "@/components/atoms/Container/Container";
import ContactForm from "@/components/organisms/ContactForm/ContactForm";

export default function CallToAction({ slice }) {
  const { primary } = slice;

  return (
    <section
      id="contact"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-24"
    >
      <Container>
        <div className="rounded-3xl bg-primary px-8 py-16 text-center md:px-16">
          {primary.heading ? (
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              {asText(primary.heading)}
            </h2>
          ) : null}
          {primary.description ? (
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              {asText(primary.description)}
            </p>
          ) : null}
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
