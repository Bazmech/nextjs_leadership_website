export default function Container({ as: Component = "div", className = "", children }) {
  return (
    <Component
      className={`mx-auto grid w-full max-w-[var(--width-container-lg)] grid-cols-12 gap-x-4 gap-y-8 px-6 md:gap-x-6 ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
