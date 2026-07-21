"use client";

import * as RadixTabs from "@radix-ui/react-tabs";

export function Tabs({ value, defaultValue, onValueChange, children, className = "" }) {
  return (
    <RadixTabs.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className={className}
    >
      {children}
    </RadixTabs.Root>
  );
}

export function TabsList({ children, className = "" }) {
  return (
    <RadixTabs.List
      className={`flex flex-wrap gap-2 border-b border-border pb-3 ${className}`.trim()}
    >
      {children}
    </RadixTabs.List>
  );
}

export function TabsTrigger({ value, children, className = "" }) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary ${className}`.trim()}
    >
      {children}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({ value, children, className = "" }) {
  return (
    <RadixTabs.Content value={value} className={`mt-6 outline-none ${className}`.trim()}>
      {children}
    </RadixTabs.Content>
  );
}
