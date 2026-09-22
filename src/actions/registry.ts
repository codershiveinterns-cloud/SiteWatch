"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { assertPermission, AuthorizationError } from "@/lib/auth/guards";
import { tenantDb } from "@/lib/tenant";
import { assetImportRowSchema, assetSchema, siteSchema } from "@/lib/validation/registry";
import { fieldErrorsFromZod, formValues, type FormState } from "@/lib/validation/form";

const SITE_FIELDS = ["name", "code", "category", "latitude", "longitude", "address", "timezone", "description"] as const;
const ASSET_FIELDS = [
  "siteId", "name", "tag", "type", "manufacturer", "model", "serialNumber", "installDate",
  "status", "criticality", "specifications", "maintenanceIntervalDays", "lastMaintenanceAt",
] as const;

type SiteFields = (typeof SITE_FIELDS)[number];
type AssetFields = (typeof ASSET_FIELDS)[number];

function fail<T extends string>(error: unknown, fallback: string, values?: Record<string, string>): FormState<T> {
  const v = values as Partial<Record<T, string>> | undefined;
  if (error instanceof AuthorizationError) return { status: "error", message: error.message, values: v };
  console.error("[registry]", error);
  return { status: "error", message: fallback, values: v };
}

function pick(formData: FormData, keys: readonly string[]) {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    const v = formData.get(k);
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

function nextMaintenance(last: Date | null, interval: number | null): Date | null {
  if (!last || !interval) return null;
  return new Date(last.getTime() + interval * 86400000);
}

// ---------------------------------------------------------------------------
// Sites
// ---------------------------------------------------------------------------

export async function saveSiteAction(siteId: string | null, _prev: FormState<SiteFields>, formData: FormData): Promise<FormState<SiteFields>> {
  const values = formValues(formData, SITE_FIELDS);
  const parsed = siteSchema.safeParse(pick(formData, SITE_FIELDS));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error), values };

  let id = siteId;
  try {
    const ctx = await assertPermission("sites:manage");
    const data = { ...parsed.data };
    if (siteId) {
      const existing = await tenantDb(ctx.organization.id).sites.find(siteId);
      if (!existing) return { status: "error", message: "Site not found.", values };
      await db.site.update({ where: { id: siteId }, data });
    } else {
      const created = await db.site.create({ data: { ...data, organizationId: ctx.organization.id } });
      id = created.id;
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "error", fieldErrors: { code: "Another site already uses this code." }, values };
    }
    return fail(error, "Could not save the site.", values);
  }
  revalidatePath("/sites");
  revalidatePath("/dashboard");
  redirect(`/sites/${id}?saved=1`);
}

export async function deleteSiteAction(siteId: string): Promise<FormState> {
  try {
    const ctx = await assertPermission("sites:manage");
    const site = await tenantDb(ctx.organization.id).sites.find(siteId);
    if (!site) return { status: "error", message: "Site not found." };
    await db.site.delete({ where: { id: site.id } });
  } catch (error) {
    return fail(error, "Could not delete the site.");
  }
  revalidatePath("/sites");
  revalidatePath("/assets");
  revalidatePath("/dashboard");
  redirect("/sites?deleted=1");
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export async function saveAssetAction(assetId: string | null, _prev: FormState<AssetFields>, formData: FormData): Promise<FormState<AssetFields>> {
  const values = formValues(formData, ASSET_FIELDS);
  const parsed = assetSchema.safeParse(pick(formData, ASSET_FIELDS));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error), values };

  let id = assetId;
  try {
    const ctx = await assertPermission("assets:manage");
    const tenant = tenantDb(ctx.organization.id);
    const site = await tenant.sites.find(parsed.data.siteId);
    if (!site) return { status: "error", fieldErrors: { siteId: "Choose a site in your organization." }, values };

    const { maintenanceIntervalDays, lastMaintenanceAt, ...rest } = parsed.data;
    const data = {
      ...rest,
      maintenanceIntervalDays,
      lastMaintenanceAt,
      nextMaintenanceAt: nextMaintenance(lastMaintenanceAt, maintenanceIntervalDays),
    };

    if (assetId) {
      const existing = await tenant.assets.find(assetId);
      if (!existing) return { status: "error", message: "Asset not found.", values };
      await db.asset.update({ where: { id: assetId }, data });
    } else {
      const created = await db.asset.create({ data: { ...data, organizationId: ctx.organization.id } });
      id = created.id;
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { status: "error", fieldErrors: { tag: "Another asset already uses this tag." }, values };
    }
    return fail(error, "Could not save the asset.", values);
  }
  revalidatePath("/assets");
  revalidatePath("/sites");
  revalidatePath("/dashboard");
  redirect(`/assets/${id}?saved=1`);
}

export async function deleteAssetAction(assetId: string): Promise<FormState> {
  let siteId: string | undefined;
  try {
    const ctx = await assertPermission("assets:manage");
    const asset = await tenantDb(ctx.organization.id).assets.find(assetId);
    if (!asset) return { status: "error", message: "Asset not found." };
    siteId = asset.siteId;
    await db.asset.delete({ where: { id: asset.id } });
  } catch (error) {
    return fail(error, "Could not delete the asset.");
  }
  revalidatePath("/assets");
  revalidatePath("/sites");
  revalidatePath("/dashboard");
  redirect(siteId ? `/sites/${siteId}?assetDeleted=1` : "/assets");
}

/** Minimal CSV parser: handles quoted fields, commas and CRLF. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

export type ImportResult = FormState & { created?: number; skipped?: Array<{ line: number; reason: string }> };

export async function importAssetsAction(_prev: ImportResult, formData: FormData): Promise<ImportResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose a CSV file to import." };
  if (file.size > 2 * 1024 * 1024) return { status: "error", message: "CSV files must be under 2 MB." };

  try {
    const ctx = await assertPermission("assets:manage");
    const tenant = tenantDb(ctx.organization.id);
    const rows = parseCsv(await file.text());
    if (rows.length < 2) return { status: "error", message: "The file has no data rows. See the template for the expected columns." };

    const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const required = ["site_code", "tag", "name", "type"];
    const missing = required.filter((r) => !header.includes(r));
    if (missing.length) return { status: "error", message: `Missing required column(s): ${missing.join(", ")}.` };

    const sites = await tenant.sites.options();
    const siteByCode = new Map(sites.map((s) => [s.code, s.id]));
    const existingTags = new Set((await db.asset.findMany({ where: { organizationId: ctx.organization.id }, select: { tag: true } })).map((a) => a.tag));

    const skipped: Array<{ line: number; reason: string }> = [];
    const toCreate: Prisma.AssetCreateManyInput[] = [];
    const seen = new Set<string>();

    rows.slice(1).forEach((cells, i) => {
      const line = i + 2;
      const record: Record<string, string> = {};
      header.forEach((h, idx) => (record[h] = (cells[idx] ?? "").trim()));
      const parsed = assetImportRowSchema.safeParse(record);
      if (!parsed.success) {
        skipped.push({ line, reason: parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ") });
        return;
      }
      const d = parsed.data;
      const siteId = siteByCode.get(d.site_code);
      if (!siteId) return void skipped.push({ line, reason: `unknown site_code "${d.site_code}"` });
      if (existingTags.has(d.tag) || seen.has(d.tag)) return void skipped.push({ line, reason: `tag "${d.tag}" already exists` });
      seen.add(d.tag);
      toCreate.push({
        organizationId: ctx.organization.id,
        siteId,
        tag: d.tag,
        name: d.name,
        type: d.type,
        manufacturer: d.manufacturer,
        model: d.model,
        serialNumber: d.serial_number,
        installDate: d.install_date,
        criticality: d.criticality,
      });
    });

    if (toCreate.length) await db.asset.createMany({ data: toCreate });
    revalidatePath("/assets");
    revalidatePath("/sites");
    revalidatePath("/dashboard");
    return {
      status: "success",
      message: `${toCreate.length} asset${toCreate.length === 1 ? "" : "s"} imported${skipped.length ? `, ${skipped.length} row${skipped.length === 1 ? "" : "s"} skipped` : ""}.`,
      created: toCreate.length,
      skipped,
    };
  } catch (error) {
    return fail(error, "Could not import the file.");
  }
}
