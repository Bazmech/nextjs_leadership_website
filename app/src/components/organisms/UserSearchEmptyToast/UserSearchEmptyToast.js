"use client";

import Toast from "@/components/atoms/Toast/Toast";

export default function UserSearchEmptyToast() {
  return (
    <Toast
      message="No users matched that search. Try another name or email."
      duration={5000}
    />
  );
}
