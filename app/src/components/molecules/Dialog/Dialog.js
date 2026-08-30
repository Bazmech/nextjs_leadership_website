"use client";

import * as RadixDialog from "@radix-ui/react-dialog";

export function Dialog({ open, defaultOpen, onOpenChange, children }) {
  return (
    <RadixDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </RadixDialog.Root>
  );
}

export function DialogTrigger({ children, asChild = false, ...props }) {
  return (
    <RadixDialog.Trigger asChild={asChild} {...props}>
      {children}
    </RadixDialog.Trigger>
  );
}

export function DialogPortal({ children, ...props }) {
  return <RadixDialog.Portal {...props}>{children}</RadixDialog.Portal>;
}

export function DialogOverlay({ className = "" }) {
  return (
    <RadixDialog.Overlay
      className={`fixed inset-0 z-[60] bg-black/40 ${className}`.trim()}
    />
  );
}

export function DialogContent({ children, className = "", ...props }) {
  return (
    <RadixDialog.Content
      className={`fixed z-[60] outline-none focus:outline-none ${className}`.trim()}
      {...props}
    >
      {children}
    </RadixDialog.Content>
  );
}

export function DialogTitle({ children, className = "" }) {
  return (
    <RadixDialog.Title className={className}>{children}</RadixDialog.Title>
  );
}

export function DialogDescription({ children, className = "" }) {
  return (
    <RadixDialog.Description className={className}>
      {children}
    </RadixDialog.Description>
  );
}

export function DialogClose({ children, asChild = false, ...props }) {
  return (
    <RadixDialog.Close asChild={asChild} {...props}>
      {children}
    </RadixDialog.Close>
  );
}
