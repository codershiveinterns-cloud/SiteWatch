"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertPermission, AuthorizationError } from "@/lib/auth/guards";
import { tenantDb } from "@/lib/tenant";
import { generateIngestKey } from "@/lib/telemetry/ingest";
import { ingestKeyNameSchema } from "@/lib/validation/registry";
import { fieldErrorsFromZod, formValues, type FormState } from "@/lib/validation/form";

export type CreateKeyState = FormState<"name"> & { rawKey?: string; keyName?: string };

export async function createIngestKeyAction(_prev: CreateKeyState, formData: FormData): Promise<CreateKeyState> {
  const values = formValues(formData, ["name"]);
  const parsed = ingestKeyNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error), values };
  try {
    const ctx = await assertPermission("telemetry:manage");
    const key = generateIngestKey();
    await db.ingestKey.create({
      data: { organizationId: ctx.organization.id, name: parsed.data.name, keyPrefix: key.prefix, keyHash: key.hash, createdById: ctx.user.id },
    });
    revalidatePath("/settings/integrations");
    return { status: "success", message: "Key created.", rawKey: key.raw, keyName: parsed.data.name };
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message, values };
    console.error("[ingest-keys]", error);
    return { status: "error", message: "Could not create the key.", values };
  }
}

export async function revokeIngestKeyAction(keyId: string): Promise<FormState> {
  try {
    const ctx = await assertPermission("telemetry:manage");
    const key = await tenantDb(ctx.organization.id).ingestKeys.find(keyId);
    if (!key) return { status: "error", message: "Key not found." };
    await db.ingestKey.update({ where: { id: key.id }, data: { revokedAt: new Date() } });
    revalidatePath("/settings/integrations");
    return { status: "success", message: `Key "${key.name}" revoked.` };
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    console.error("[ingest-keys]", error);
    return { status: "error", message: "Could not revoke the key." };
  }
}
