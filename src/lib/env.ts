import { z } from "zod";

/**
 * Validated server environment. Imported only from server code and evaluated
 * lazily (first call), so `next build` does not require runtime secrets.
 */
const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const envSchema = z.object({
  DATABASE_URL: z.preprocess(
    blankToUndefined,
    z.string({ message: "DATABASE_URL is required" }).url({ message: "DATABASE_URL must be a valid PostgreSQL URL" }),
  ),
  APP_URL: z.preprocess(blankToUndefined, z.string().url().optional()),
  SESSION_TTL_DAYS: z.preprocess(
    (v) => (blankToUndefined(v) === undefined ? 30 : Number(v)),
    z.number().int().min(1).max(365),
  ),
  ALLOW_DEMO_SEED: z.preprocess(blankToUndefined, z.string().optional()).transform((v) => v === "true"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  VERCEL_URL: z.preprocess(blankToUndefined, z.string().optional()),
});

export type Env = Omit<z.infer<typeof envSchema>, "APP_URL" | "VERCEL_URL"> & { APP_URL: string };

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  const { APP_URL, VERCEL_URL, ...rest } = parsed.data;
  // On Vercel the deployment URL is provided automatically; APP_URL overrides it.
  const appUrl = APP_URL ?? (VERCEL_URL ? `https://${VERCEL_URL}` : "http://localhost:3000");
  cached = { ...rest, APP_URL: appUrl };
  return cached;
}
