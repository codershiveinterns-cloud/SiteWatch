"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertPermission, AuthorizationError } from "@/lib/auth/guards";
import { tenantDb } from "@/lib/tenant";
import { randomInt } from "node:crypto";
import { hashPassword } from "@/lib/auth/password";
import { addMemberSchema, changeMemberRoleSchema } from "@/lib/validation/settings";
import { fieldErrorsFromZod, formValues, type FormState } from "@/lib/validation/form";
import { Role, ROLE_META } from "@/lib/rbac/roles";

type AddMemberFields = "name" | "email" | "role";

function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 14; i++) out += alphabet[randomInt(alphabet.length)];
  return out;
}

export async function changeMemberRoleAction(input: { membershipId: string; role: string }): Promise<FormState> {
  const parsed = changeMemberRoleSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "Invalid role selection." };

  try {
    const ctx = await assertPermission("team:manage");
    const tenant = tenantDb(ctx.organization.id);

    // Tenant isolation: the membership must belong to the caller's organization.
    const membership = await tenant.memberships.find(parsed.data.membershipId);
    if (!membership) return { status: "error", message: "Member not found in your organization." };

    if (membership.role === Role.ADMIN && parsed.data.role !== Role.ADMIN) {
      const admins = await db.membership.count({ where: { organizationId: ctx.organization.id, role: Role.ADMIN } });
      if (admins <= 1) {
        return { status: "error", message: "An organization needs at least one Admin. Promote someone else first." };
      }
    }

    await db.membership.update({ where: { id: membership.id }, data: { role: parsed.data.role } });
    revalidatePath("/team");
    revalidatePath("/", "layout");
    return {
      status: "success",
      message: `${membership.user.name} is now ${ROLE_META[parsed.data.role].label}.`,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    console.error("[team] role change failed", error);
    return { status: "error", message: "Could not update the member's role." };
  }
}

export async function addMemberAction(
  _prev: FormState<AddMemberFields>,
  formData: FormData,
): Promise<FormState<AddMemberFields> & { temporaryPassword?: string; memberName?: string }> {
  const values = formValues(formData, ["name", "email", "role"]);
  const parsed = addMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error), values };

  try {
    const ctx = await assertPermission("team:manage");
    const existing = await db.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
    if (existing) {
      return { status: "error", fieldErrors: { email: "This email is already registered." }, values };
    }

    // Temporary password shown once to the Admin; the member changes it under
    // Settings → Security. Email invitations arrive with the notification engine.
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash } });
      await tx.membership.create({
        data: { userId: user.id, organizationId: ctx.organization.id, role: parsed.data.role },
      });
    });

    revalidatePath("/team");
    return { status: "success", message: "Member added.", temporaryPassword, memberName: parsed.data.name };
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message, values };
    console.error("[team] add member failed", error);
    return { status: "error", message: "Could not add the member.", values };
  }
}
