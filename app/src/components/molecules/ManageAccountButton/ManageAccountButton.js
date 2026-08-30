"use client";

import { useClerk } from "@clerk/nextjs";
import Button from "@/components/atoms/Button/Button";

export default function ManageAccountButton({
  variant = "accent-sm",
  className = "",
  children = "Manage account",
}) {
  const { openUserProfile } = useClerk();

  return (
    <Button
      type="button"
      variant={variant}
      className={`cursor-pointer ${className}`.trim()}
      onClick={() => openUserProfile()}
    >
      {children}
    </Button>
  );
}
