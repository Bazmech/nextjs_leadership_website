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
