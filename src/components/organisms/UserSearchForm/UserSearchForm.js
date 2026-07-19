"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button/Button";
import FormField from "@/components/molecules/FormField/FormField";

const MIN_QUERY_LENGTH = 3;

export default function UserSearchForm({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const canSearch = query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <form
      method="get"
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={(event) => {
        if (!canSearch) {
          event.preventDefault();
        }
      }}
    >
      <div className="min-w-0 flex-1">
        <FormField
          id="q"
          label="Search users by name or email"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          variant="default"
          autoComplete="off"
          minLength={MIN_QUERY_LENGTH}
        />
      </div>
      <Button
        type="submit"
        variant="accent-sm"
        className="shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canSearch}
      >
        Search
      </Button>
    </form>
  );
}
