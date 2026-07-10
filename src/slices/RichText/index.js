import RichTextBlock from "@/components/organisms/RichTextBlock/RichTextBlock";

export default function RichText({ slice }) {
  return (
    <div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
      <RichTextBlock text={slice.primary.text} />
    </div>
  );
}
