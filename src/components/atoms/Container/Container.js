export default function Container({ as: Component = "div", className = "", children }) {
  return (
    <Component
      className={`mx-auto w-full max-w-[var(--width-container-lg)] px-6 ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
