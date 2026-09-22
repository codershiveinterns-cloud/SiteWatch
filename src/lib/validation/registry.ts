import { z } from "zod";
import { AssetStatus, Criticality, SiteCategory } from "@/generated/prisma/enums";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

/** Coerces form input to a number but treats blank as missing. */
const requiredNumber = (message: string) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.coerce.number({ message }).refine((n) => Number.isFinite(n), message));

export const siteCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(2, "Code is required")
  .max(16, "Keep the code under 16 characters")
  .regex(/^[A-Z0-9][A-Z0-9-]*$/, "Use letters, numbers and dashes only");

export const siteSchema = z.object({
  name: z.string().trim().min(2, "Enter a site name").max(80),
  code: siteCodeSchema,
  category: z.nativeEnum(SiteCategory, { message: "Choose a site category" }),
  latitude: requiredNumber("Enter a latitude").pipe(z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90")),
  longitude: requiredNumber("Enter a longitude").pipe(z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180")),
  address: optionalText(160),
  timezone: optionalText(64),
  description: optionalText(500),
});
export type SiteInput = z.infer<typeof siteSchema>;

const today = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

export const assetTagSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(2, "Tag is required")
  .max(24, "Keep the tag under 24 characters")
  .regex(/^[A-Z0-9][A-Z0-9-]*$/, "Use letters, numbers and dashes only");

export const specificationsSchema = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine(
    (v) => {
      if (v === null) return true;
      try {
        const parsed = JSON.parse(v);
        return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
      } catch {
        return false;
      }
    },
    { message: 'Specifications must be a JSON object, e.g. {"rated_kw": 100}' },
  );

export const assetSchema = z.object({
  siteId: z.string().min(1, "Choose a site"),
  name: z.string().trim().min(2, "Enter an asset name").max(80),
  tag: assetTagSchema,
  type: z.string().trim().min(2, "Enter an asset type").max(40),
  manufacturer: optionalText(60),
  model: optionalText(60),
  serialNumber: optionalText(60),
  installDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? new Date(v) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), "Enter a valid date")
    .refine((d) => d === null || d <= today(), "Install date cannot be in the future"),
  status: z.nativeEnum(AssetStatus),
  criticality: z.nativeEnum(Criticality),
  specifications: specificationsSchema,
  maintenanceIntervalDays: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((n) => n === null || (Number.isInteger(n) && n >= 1 && n <= 3650), "Enter a whole number of days (1–3650)"),
  lastMaintenanceAt: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? new Date(v) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), "Enter a valid date")
    .refine((d) => d === null || d <= today(), "Maintenance date cannot be in the future"),
});
export type AssetInput = z.infer<typeof assetSchema>;

/** Row shape accepted by the CSV importer (headers are case-insensitive). */
export const assetImportRowSchema = z.object({
  site_code: siteCodeSchema,
  tag: assetTagSchema,
  name: z.string().trim().min(2).max(80),
  type: z.string().trim().min(2).max(40),
  manufacturer: optionalText(60),
  model: optionalText(60),
  serial_number: optionalText(60),
  install_date: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? new Date(v) : null))
    .refine((d) => d === null || (!Number.isNaN(d.getTime()) && d <= today()), "Invalid or future install date"),
  criticality: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => (v && v.length ? v : "MEDIUM"))
    .pipe(z.nativeEnum(Criticality)),
});

/** Telemetry payload accepted by POST /api/ingest/telemetry. */
export const telemetryEventSchema = z.object({
  asset_tag: z.string().trim().min(1).max(24),
  metric: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z][a-z0-9_]*$/, "metric must be snake_case"),
  value: z.number().finite(),
  unit: z.string().trim().max(16).optional(),
  recorded_at: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((v) => (v ? new Date(v) : new Date())),
});


export const ingestKeyNameSchema = z.object({
  name: z.string().trim().min(2, "Give the key a name").max(60),
});
