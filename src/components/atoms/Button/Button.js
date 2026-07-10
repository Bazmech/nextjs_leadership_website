const variants = {
  primary:
    "rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light",
  accent:
    "inline-flex items-center justify-center rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-light",
  "accent-sm":
    "inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light",
  secondary:
    "inline-flex items-center justify-center rounded-full border border-border bg-surface px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5",
  ghost:
    "rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground",
};

export default function Button({
  as = "button",
  variant = "primary",
  href,
  className = "",
  children,
  ...props
}) {
  const classes = `${variants[variant] ?? variants.primary} ${className}`.trim();

  if (as === "a" || href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  if (as === "span") {
    return (
      <span className={classes} {...props}>
        {children}
      </span>
    );
  }

  return (
    <button type={props.type ?? "button"} className={classes} {...props}>
      {children}
    </button>
  );
}
