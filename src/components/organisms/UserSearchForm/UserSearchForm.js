import Button from "@/components/atoms/Button/Button";
import FormField from "@/components/molecules/FormField/FormField";

export default function UserSearchForm({ initialQuery = "" }) {
  return (
    <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
          <FormField
          id="q"
          label="Search users by name or email"
          type="search"
          defaultValue={initialQuery}
          placeholder="Search by name or email"
          variant="default"
          autoComplete="off"
        />
      </div>
      <Button type="submit" variant="accent-sm" className="shrink-0">
        Search
      </Button>
    </form>
  );
}
