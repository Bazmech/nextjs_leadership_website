"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

function format(date, mode) {
  if (mode === "date") return date.toLocaleDateString();
  if (mode === "time") return date.toLocaleTimeString();
  return date.toLocaleString();
}

/**
 * Renders a date/time using the browser's locale and timezone.
 * Server render uses the server locale; a client snapshot after
 * hydration re-formats so the visitor always sees their own local formatting.
 */
export default function LocalDateTime({ value, mode = "datetime", className }) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return <span className={className}>—</span>;
  }

  return (
    <time
      dateTime={date.toISOString()}
      className={className}
      data-hydrated={isClient ? "" : undefined}
      suppressHydrationWarning
    >
      {format(date, mode)}
    </time>
  );
}
