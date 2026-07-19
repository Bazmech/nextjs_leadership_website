"use client";

import * as RadixToast from "@radix-ui/react-toast";
import { useState } from "react";

export default function Toast({
  message,
  duration = 5000,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  className = "",
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  function handleOpenChange(nextOpen) {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  }

  return (
    <RadixToast.Provider duration={duration} swipeDirection="right">
      <RadixToast.Root
        open={open}
        onOpenChange={handleOpenChange}
        duration={duration}
        type="foreground"
        className={`rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-lg transition-opacity duration-[400ms] data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] ${className}`.trim()}
      >
        <RadixToast.Description>{message}</RadixToast.Description>
      </RadixToast.Root>
      <RadixToast.Viewport className="fixed bottom-6 left-1/2 z-50 flex w-[min(100vw-2rem,24rem)] -translate-x-1/2 list-none flex-col gap-2 outline-none" />
    </RadixToast.Provider>
  );
}
