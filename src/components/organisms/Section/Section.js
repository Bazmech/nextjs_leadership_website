import Container from "@/components/atoms/Container/Container";

export default function Section({
  id,
  as: Component = "section",
  className = "",
  containerClassName = "",
  children,
  ...props
}) {
  return (
    <Component id={id} className={className} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </Component>
  );
}
