"use client";

import { useEffect, useState } from "react";

function format(date, mode) {
  if (mode === "date") return date.toLocaleDateString();
  if (mode === "time") return date.toLocaleTimeString();
  return date.toLocaleString();
}

/**
 * Renders a date/time using the browser's locale and timezone.
 * Server render uses the server locale; the effect re-formats after
 * hydration so the visitor always sees their own local formatting.
 */
export default function LocalDateTime({ value, mode = "datetime", className }) {
  const date = value ? new Date(value) : null;
  const [text, setText] = useState(null);

  useEffect(() => {
    if (value) {
      setText(format(new Date(value), mode));
    }
  }, [value, mode]);

  if (!date || Number.isNaN(date.getTime())) {
    return <span className={className}>—</span>;
  }

  return (
    <time
      dateTime={date.toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {text ?? format(date, mode)}
    </time>
  );
}
