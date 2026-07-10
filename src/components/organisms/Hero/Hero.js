import Button from "@/components/atoms/Button/Button";
import Container from "@/components/atoms/Container/Container";
import Eyebrow from "@/components/atoms/Eyebrow/Eyebrow";
import StatCard from "@/components/molecules/StatCard/StatCard";

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "200+", label: "Leaders Coached" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "40+", label: "Organizations Served" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <Container>
        <Eyebrow className="mb-4">
          Executive Coaching &amp; Leadership Development
        </Eyebrow>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
          Lead with clarity, confidence, and purpose
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
          We partner with executives and emerging leaders to build high-performing
          teams, navigate change, and unlock their full potential.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:w-fit">
          <Button as="a" href="#contact" variant="accent">
            Start Your Journey
          </Button>
          <Button as="a" href="#services" variant="secondary">
            Explore Services
          </Button>
        </div>
        <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-10 md:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </dl>
      </Container>
    </section>
  );
}
