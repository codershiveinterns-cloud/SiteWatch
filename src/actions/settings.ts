"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertPermission, AuthorizationError } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { revokeOtherSessions } from "@/lib/auth/session";
import { changePasswordSchema, updateOrganizationSchema, updateProfileSchema } from "@/lib/validation/settings";
import { fieldErrorsFromZod, formValues, type FormState } from "@/lib/validation/form";

function failure<T extends string>(error: unknown, fallback: string): FormState<T> {
  if (error instanceof AuthorizationError) return { status: "error", message: error.message };
  console.error("[settings]", error);
  return { status: "error", message: fallback };
}

export async function updateProfileAction(_prev: FormState<"name">, formData: FormData): Promise<FormState<"name">> {
  const values = formValues(formData, ["name"]);
  const parsed = updateProfileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error), values };
  try {
    const ctx = await assertPermission("account:manage");
    await db.user.update({ where: { id: ctx.user.id }, data: { name: parsed.data.name } });
    revalidatePath("/", "layout");
    return { status: "success", message: "Profile updated." };
  } catch (error) {
    return failure(error, "Could not update your profile.");
  }
}

type OrgFields = "name" | "timezone";

export async function updateOrganizationAction(
  _prev: FormState<OrgFields>,
  formData: FormData,
): Promise<FormState<OrgFields>> {
  const values = formValues(formData, ["name", "timezone"]);
  const parsed = updateOrganizationSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error), values };
  try {
    const ctx = await assertPermission("organization:manage");
    // Scoped to the session's organization: a user can never edit another tenant.
    await db.organization.update({ where: { id: ctx.organization.id }, data: parsed.data });
    revalidatePath("/", "layout");
    return { status: "success", message: "Organization updated." };
  } catch (error) {
    return failure(error, "Could not update the organization.");
  }
}

type PasswordFields = "currentPassword" | "newPassword" | "confirmPassword";

export async function changePasswordAction(
  _prev: FormState<PasswordFields>,
  formData: FormData,
): Promise<FormState<PasswordFields>> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error) };
  try {
    const ctx = await assertPermission("account:manage");
    const user = await db.user.findUniqueOrThrow({ where: { id: ctx.user.id }, select: { passwordHash: true } });
    const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!ok) return { status: "error", fieldErrors: { currentPassword: "Current password is incorrect." } };

    await db.user.update({
      where: { id: ctx.user.id },
      data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });
    // Changing a password invalidates every other device.
    const revoked = await revokeOtherSessions(ctx.user.id, ctx.session.id);
    revalidatePath("/settings/security");
    return {
      status: "success",
      message: revoked > 0 ? `Password changed. ${revoked} other session${revoked === 1 ? "" : "s"} signed out.` : "Password changed.",
    };
  } catch (error) {
    return failure(error, "Could not change your password.");
  }
}

export async function revokeOtherSessionsAction(): Promise<FormState> {
  try {
    const ctx = await assertPermission("account:manage");
    const revoked = await revokeOtherSessions(ctx.user.id, ctx.session.id);
    revalidatePath("/settings/security");
    return {
      status: "success",
      message: revoked === 0 ? "No other sessions were active." : `Signed out ${revoked} other session${revoked === 1 ? "" : "s"}.`,
    };
  } catch (error) {
    return failure(error, "Could not revoke sessions.");
  }
}
