"use client";

import {
  SignInButton,
  SignUpButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Button from "@/components/atoms/Button/Button";

export default function AuthNav({ inverse = false }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div
        className={`h-9 w-28 animate-pulse rounded-full ${
          inverse ? "bg-white/20" : "bg-border"
        }`}
      />
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className={`hidden text-sm font-medium transition-colors sm:inline ${
            inverse
              ? "text-white/90 hover:text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Dashboard
        </Link>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <Button variant={inverse ? "ghost-inverse" : "ghost"}>Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button variant={inverse ? "on-primary" : "primary"}>Sign up</Button>
      </SignUpButton>
    </div>
  );
}
