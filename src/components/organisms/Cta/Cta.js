import Container from "@/components/atoms/Container/Container";
import ContactForm from "@/components/organisms/ContactForm/ContactForm";

export default function Cta() {
  return (
    <section id="contact" className="py-24">
      <Container>
        <div className="rounded-3xl bg-primary px-8 py-16 text-center md:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to elevate your leadership?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Schedule a complimentary 30-minute discovery call. We&apos;ll discuss
            your goals and how we can help you achieve them.
          </p>
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
