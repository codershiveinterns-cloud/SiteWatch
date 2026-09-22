"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroyCurrentSession } from "@/lib/auth/session";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";
import { fieldErrorsFromZod, formValues, type FormState } from "@/lib/validation/form";
import { slugify } from "@/lib/utils";
import { Role } from "@/lib/rbac/roles";

type SignUpFields = "name" | "email" | "password" | "organizationName";
type SignInFields = "email" | "password";

function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "organization";
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = attempt === 0 ? root : `${root}-${Math.random().toString(36).slice(2, 6)}`;
    const exists = await db.organization.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!exists) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function signUpAction(
  _prev: FormState<SignUpFields>,
  formData: FormData,
): Promise<FormState<SignUpFields>> {
  const values = formValues(formData, ["name", "email", "organizationName"]);
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    organizationName: formData.get("organizationName"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error), values };
  }

  const { name, email, password, organizationName } = parsed.data;

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return {
      status: "error",
      fieldErrors: { email: "An account with this email already exists. Sign in instead." },
      values,
    };
  }

  let userId: string;
  let organizationId: string;
  try {
    const passwordHash = await hashPassword(password);
    const slug = await uniqueSlug(organizationName);

    // The first user of a new tenant is its Admin. Subsequent members are
    // added by an Admin from the Team page and default to Viewer.
    const result = await db.$transaction(async (tx) => {
      const organization = await tx.organization.create({ data: { name: organizationName, slug } });
      const user = await tx.user.create({ data: { name, email, passwordHash } });
      await tx.membership.create({
        data: { userId: user.id, organizationId: organization.id, role: Role.ADMIN },
      });
      return { userId: user.id, organizationId: organization.id };
    });
    userId = result.userId;
    organizationId = result.organizationId;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "error", fieldErrors: { email: "An account with this email already exists." }, values };
    }
    console.error("[auth] sign-up failed", error);
    return { status: "error", message: "We could not create your workspace. Please try again.", values };
  }

  await createSession(userId, organizationId);
  redirect("/dashboard?welcome=1");
}

export async function signInAction(
  _prev: FormState<SignInFields>,
  formData: FormData,
): Promise<FormState<SignInFields>> {
  const values = formValues(formData, ["email"]);
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error), values };
  }

  const { email, password } = parsed.data;
  const invalid: FormState<SignInFields> = {
    status: "error",
    message: "Incorrect email or password.",
    values,
  };

  let target: { userId: string; organizationId: string } | null = null;
  try {
    const user = await db.user.findUnique({
      where: { email },
      include: { memberships: { orderBy: { createdAt: "asc" }, take: 1, select: { organizationId: true } } },
    });
    // Constant-ish time: always run a compare even when the user is unknown.
    const ok = user
      ? await verifyPassword(password, user.passwordHash)
      : await verifyPassword(password, "$2a$12$CwTycUXWue0Thq9StjUM0uJ8b2s7nQ7Yq2oOgnH4OGPqpwzLZh8xu").then(() => false);
    if (!user || !ok) return invalid;

    const membership = user.memberships[0];
    if (!membership) {
      return { status: "error", message: "Your account is not a member of any organization.", values };
    }
    target = { userId: user.id, organizationId: membership.organizationId };
  } catch (error) {
    console.error("[auth] sign-in failed", error);
    return { status: "error", message: "Sign-in is temporarily unavailable. Please try again.", values };
  }

  await destroyCurrentSession();
  await createSession(target.userId, target.organizationId);
  redirect(safeNext(parsed.data.next));
}

export async function signOutAction(): Promise<void> {
  await destroyCurrentSession();
  redirect("/login?reason=signed-out");
}
