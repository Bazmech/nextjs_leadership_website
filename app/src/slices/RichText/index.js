import RichTextBlock from "@/components/organisms/RichTextBlock/RichTextBlock";

export default function RichText({ slice }) {
  return (
    <div data-slice-type={slice._type}>
      <RichTextBlock text={slice.text} />
    </div>
  );
}
