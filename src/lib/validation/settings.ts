import { z } from "zod";
import { emailSchema, nameSchema, organizationNameSchema, passwordSchema } from "./auth";
import { Role } from "@/lib/rbac/roles";

export const updateProfileSchema = z.object({
  name: nameSchema,
});

export const updateOrganizationSchema = z.object({
  name: organizationNameSchema,
  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required")
    .max(64)
    .refine((tz) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, "Enter a valid IANA timezone, e.g. Europe/London"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const changeMemberRoleSchema = z.object({
  membershipId: z.string().min(1),
  role: z.nativeEnum(Role),
});

export const addMemberSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: z.nativeEnum(Role, { message: "Choose a role" }),
});
