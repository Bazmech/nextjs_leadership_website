import CheckListItem from "@/components/molecules/CheckListItem/CheckListItem";
import SectionHeader from "@/components/molecules/SectionHeader/SectionHeader";
import Section from "@/components/organisms/Section/Section";

const highlights = [
  "ICF-certified executive coaches",
  "Customized development plans",
  "Measurable outcomes and progress tracking",
];

export default function About() {
  return (
    <Section id="about" className="py-24">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="relative aspect-square max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-light">
          <div className="grid h-full place-items-center">
            <span className="text-8xl font-bold text-white/20" aria-hidden="true">
              EL
            </span>
          </div>
        </div>
        <div>
          <SectionHeader
            eyebrow="About Us"
            title="Trusted partners in leadership growth"
          />
          <p className="mt-6 leading-relaxed text-muted">
            ElevateLeadership was founded on a simple belief: great leaders are
            made, not born. Our coaches bring decades of experience in Fortune 500
            boardrooms, startups, and nonprofit organizations.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            We combine evidence-based frameworks with practical, real-world
            application — so you leave every session with tools you can use
            immediately.
          </p>
          <ul className="mt-8 grid gap-3">
            {highlights.map((item) => (
              <CheckListItem key={item}>{item}</CheckListItem>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
