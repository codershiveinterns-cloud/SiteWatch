import { z } from "zod";

/**
 * Validated server environment. Imported only from server code.
 * Fails fast at boot when a required variable is missing or malformed.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid PostgreSQL URL" }),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  ALLOW_DEMO_SEED: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
