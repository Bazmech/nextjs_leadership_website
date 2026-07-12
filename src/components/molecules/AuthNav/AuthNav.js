"use client";

import {
  SignInButton,
  SignUpButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Button from "@/components/atoms/Button/Button";

export default function AuthNav() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className="h-9 w-28 animate-pulse rounded-full bg-border" />;
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:inline"
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
        <Button variant="ghost">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button variant="primary">Sign up</Button>
      </SignUpButton>
    </div>
  );
}
