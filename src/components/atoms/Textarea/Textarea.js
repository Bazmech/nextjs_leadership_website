const variants = {
  default:
    "w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
  onDark:
    "w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
};

export default function Textarea({
  variant = "default",
  className = "",
  ...props
}) {
  return (
    <textarea
      className={`${variants[variant] ?? variants.default} ${className}`.trim()}
      {...props}
    />
  );
}
