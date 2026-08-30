"use server";

import { revalidatePath } from "next/cache";
import { updateUserSchema, waitlistDecisionSchema } from "@/lib/schemas/user";
import {
  decideWaitlistEntries,
  getManagedUser,
  searchAppUsers,
  updateManagedUser,
} from "@/lib/users";

/**
 * Admin/super_admin user search — cross-user reads allowed on this staff surface.
 * See user-data-authorization.mdc.
 */
export async function searchUsers(query) {
  try {
    return await searchAppUsers(query);
  } catch (error) {
    console.error("searchUsers failed:", error);
    return [];
  }
}

/**
 * Admin/super_admin load user for edit — cross-user read on this staff surface.
 * See user-data-authorization.mdc.
 */
export async function getUserForEdit(userId) {
  try {
    return await getManagedUser(userId);
  } catch (error) {
    console.error("getUserForEdit failed:", error);
    return null;
  }
}

/**
 * Admin/super_admin update role/enabled — cross-user write on this staff surface.
 * See user-data-authorization.mdc.
 */
export async function updateUser(_prevState, formData) {
  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    roleName: formData.get("roleName"),
    enabled: formData.get("enabled"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? "Please fix the highlighted fields.";

    return {
      success: false,
      error: firstError,
      message: null,
    };
  }

  try {
    const result = await updateManagedUser(parsed.data);

    if (!result.ok) {
      return {
        success: false,
        error: result.error,
        message: null,
      };
    }

    revalidatePath("/dashboard/users");
    revalidatePath(`/dashboard/users/${parsed.data.userId}`);

    return {
      success: true,
      error: null,
      message: "User updated.",
    };
  } catch (error) {
    console.error("updateUser failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}

function parseWaitlistEntryIds(formData) {
  const fromAll = formData
    .getAll("entryIds")
    .filter((value) => typeof value === "string" && value);
  if (fromAll.length) {
    return fromAll;
  }

  const single = formData.get("entryId");
  return typeof single === "string" && single ? [single] : [];
}

/**
 * Staff: accept (invite) or deny (reject) Clerk waitlist entries.
 * Cross-user admin surface — see user-data-authorization.mdc.
 */
export async function decideWaitlist(_prevState, formData) {
  const parsed = waitlistDecisionSchema.safeParse({
    decision: formData.get("decision"),
    entryIds: parseWaitlistEntryIds(formData),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? "Please fix the highlighted fields.";

    return {
      success: false,
      error: firstError,
      message: null,
    };
  }

  try {
    const result = await decideWaitlistEntries(parsed.data);

    if (!result.ok) {
      return {
        success: false,
        error: result.error,
        message: null,
      };
    }

    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/users/waitlist");

    return {
      success: true,
      error: null,
      message: result.message,
    };
  } catch (error) {
    console.error("decideWaitlist failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again shortly.",
      message: null,
    };
  }
}
