"use client";

import * as RadixCollapsible from "@radix-ui/react-collapsible";

export function CollapsibleRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  className = "",
}) {
  return (
    <RadixCollapsible.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className={className}
    >
      {children}
    </RadixCollapsible.Root>
  );
}

export function CollapsibleTrigger({ children, className = "", ...props }) {
  return (
    <RadixCollapsible.Trigger className={className} {...props}>
      {children}
    </RadixCollapsible.Trigger>
  );
}

export function CollapsibleContent({ children, className = "" }) {
  return (
    <RadixCollapsible.Content className={className}>
      {children}
    </RadixCollapsible.Content>
  );
}
