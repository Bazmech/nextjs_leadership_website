"use client";

import { useState } from "react";
import AuthNav from "@/components/molecules/AuthNav/AuthNav";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/molecules/Dialog/Dialog";
import NavMenuList from "@/components/molecules/NavMenuList/NavMenuList";

export default function MobileNav({ menuItems, showUserLinks = true }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="md:hidden" />
        <DialogContent className="inset-x-0 top-0 max-h-dvh overflow-y-auto border-b border-border bg-surface p-6 shadow-lg md:hidden">
          <div className="mb-6 flex items-center justify-between gap-4">
            <DialogTitle className="text-base font-semibold text-foreground">
              Menu
            </DialogTitle>
            <DialogDescription className="sr-only">
              Site links and account controls
            </DialogDescription>
            <DialogClose asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary/5"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </DialogClose>
          </div>

          <div className="grid gap-8">
            {menuItems?.length ? (
              <nav aria-label="Mobile">
                <NavMenuList
                  items={menuItems}
                  variant="inline"
                  className="grid gap-4"
                  onNavigate={() => setOpen(false)}
                />
              </nav>
            ) : null}

            <div className="border-t border-border pt-6">
              <AuthNav
                showUserLinks={showUserLinks}
                alwaysShowDashboard
                stack
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
