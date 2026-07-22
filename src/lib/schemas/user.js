import { z } from "zod";

export const updateUserSchema = z.object({
  userId: z.string().uuid("Invalid user."),
  roleName: z.enum(["default", "admin", "super_admin"], {
    error: "Select a valid role.",
  }),
  enabled: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
});

export const waitlistDecisionSchema = z.object({
  decision: z.enum(["accept", "deny"], {
    error: "Choose accept or deny.",
  }),
  entryIds: z
    .array(z.string().min(1, "Invalid wait list entry."))
    .min(1, "Select at least one wait list entry."),
});
