const variants = {
  default:
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
  onDark:
    "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
};

export default function Input({
  variant = "default",
  className = "",
  ...props
}) {
  return (
    <input
      className={`${variants[variant] ?? variants.default} ${className}`.trim()}
      {...props}
    />
  );
}
