"use client";

import { useActionState, useState } from "react";
import { updateUser } from "@/actions/users";
import Button from "@/components/atoms/Button/Button";
import SelectField from "@/components/molecules/SelectField/SelectField";
import SwitchField from "@/components/molecules/SwitchField/SwitchField";

const initialState = {
  success: false,
  error: null,
  message: null,
};

const ALL_ROLE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super admin" },
];

export default function EditUserForm({ user }) {
  const [roleName, setRoleName] = useState(user.roleName);
  const [enabled, setEnabled] = useState(user.enabled);
  const [state, formAction, isPending] = useActionState(
    updateUser,
    initialState,
  );

  const roleOptions =
    user.actorRoleName === "admin"
      ? ALL_ROLE_OPTIONS.filter((option) => option.value !== "super_admin")
      : ALL_ROLE_OPTIONS;

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="userId" value={user.id} />

      <SelectField
        id="roleName"
        label="Role"
        name="roleName"
        value={roleName}
        onValueChange={setRoleName}
        options={roleOptions}
        placeholder="Select a role"
      />

      <SwitchField
        id="enabled"
        label="Account enabled"
        description={
          user.isSelf
            ? "You cannot disable your own account."
            : "Disabled accounts cannot access the dashboard."
        }
        name="enabled"
        checked={enabled}
        onCheckedChange={setEnabled}
        disabled={user.isSelf}
      />

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p
          className="text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="accent-sm"
        disabled={isPending}
        className="disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
