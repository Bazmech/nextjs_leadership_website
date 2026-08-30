export default function SliceZone({ slices = [], components }) {
  if (!Array.isArray(slices) || slices.length === 0) return null;

  return slices.map((slice) => {
    const Component = components[slice._type];
    if (!Component) return null;

    return <Component key={slice._key} slice={slice} />;
  });
}
