export default function ServiceCard({ icon, title, description }) {
  return (
    <article className="group rounded-2xl border border-border bg-background p-8 transition-shadow hover:shadow-lg">
      <span className="text-2xl text-accent" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-4 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 leading-relaxed text-muted">{description}</p>
    </article>
  );
}
