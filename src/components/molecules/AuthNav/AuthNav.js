"use client";

import {
  SignInButton,
  SignUpButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Button from "@/components/atoms/Button/Button";

export default function AuthNav({
  inverse = false,
  showUserLinks = true,
  alwaysShowDashboard = false,
  stack = false,
  onNavigate,
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const layoutClass = stack
    ? "flex flex-col items-stretch gap-3"
    : "flex items-center gap-3";

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
      <div className={layoutClass}>
        {showUserLinks ? (
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className={`text-sm font-medium transition-colors ${
              alwaysShowDashboard ? "" : "hidden sm:inline"
            } ${
              stack ? "py-1" : ""
            } ${
              inverse
                ? "text-white/90 hover:text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Dashboard
          </Link>
        ) : null}
        <div className={stack ? "flex items-center gap-3" : undefined}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={layoutClass}>
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <Button
          variant={inverse ? "ghost-inverse" : "ghost"}
          onClick={onNavigate}
          className={stack ? "w-full justify-center" : undefined}
        >
          Sign in
        </Button>
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button
          variant={inverse ? "on-primary" : "primary"}
          onClick={onNavigate}
          className={stack ? "w-full justify-center" : undefined}
        >
          Sign up
        </Button>
      </SignUpButton>
    </div>
  );
}
