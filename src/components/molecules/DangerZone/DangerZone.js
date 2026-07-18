"use client";

import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "@/components/atoms/Collapsible/Collapsible";

export default function DangerZone({
  title = "Danger zone",
  description = "Irreversible or privileged actions. Proceed with care.",
  children,
  className = "",
}) {
  return (
    <CollapsibleRoot
      defaultOpen={false}
      className={`rounded-2xl border border-red-300 bg-surface ${className}`.trim()}
    >
      <CollapsibleTrigger className="group flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-red-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
        <span className="min-w-0">
          <span className="block text-lg font-semibold text-red-700">
            {title}
          </span>
          <span className="mt-1 block text-sm text-red-700/80">
            {description}
          </span>
        </span>
        <span
          className="mt-1 shrink-0 text-red-600 transition-transform group-data-[state=open]:rotate-180"
          aria-hidden="true"
        >
          <ChevronIcon />
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden">
        <div className="border-t border-red-200 px-6 py-5">{children}</div>
      </CollapsibleContent>
    </CollapsibleRoot>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
