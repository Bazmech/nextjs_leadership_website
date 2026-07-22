import Button from "@/components/atoms/Button/Button";

export default function ExportSubmissionCsvButton({
  submissionId,
  className = "",
}) {
  return (
    <Button
      as="a"
      href={`/dashboard/assessments/submissions/${submissionId}/csv`}
      variant="secondary"
      className={`!px-5 !py-2 !text-sm ${className}`.trim()}
    >
      Export CSV
    </Button>
  );
}
