import { SliceSimulator, getSlices } from "@prismicio/next";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";

export default async function SliceSimulatorPage({ searchParams }) {
  const { state } = await searchParams;

  return (
    <SliceSimulator state={state}>
      <SliceZone slices={getSlices(state)} components={components} />
    </SliceSimulator>
  );
}
