"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button/Button";
import FormField from "@/components/molecules/FormField/FormField";

export default function WaitlistSearchForm({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      method="get"
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <FormField
          id="q"
          label="Search wait list by email"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by email"
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
