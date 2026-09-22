import fs from "node:fs";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * Prisma client singleton backed by a local SQLite file.
 *
 * The client is created on first use rather than at import time, so
 * `next build` never needs the database. In development the instance is
 * cached on `globalThis` to survive hot reload.
 *
 * On serverless hosts (Vercel) the deployment bundle is read-only, so the
 * database file that was migrated and seeded at build time is copied to the
 * writable temp directory on cold start. Data written there lives only as
 * long as that instance; swap DATABASE_URL to a managed database for durable
 * storage (see README).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function resolveDatabaseFile(): string {
  const url = env().DATABASE_URL;
  const relative = url.replace(/^file:/, "");
  const source = path.resolve(process.cwd(), relative);

  const readOnlyHost = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (!readOnlyHost) return source;

  const scratch = path.join("/tmp", "sitewatch.db");
  if (!fs.existsSync(scratch)) {
    if (!fs.existsSync(source)) {
      throw new Error(`Bundled database not found at ${source}. Run "prisma migrate deploy" during the build.`);
    }
    fs.copyFileSync(source, scratch);
  }
  return scratch;
}

function createClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseFile() });
  return new PrismaClient({
    adapter,
    log: env().NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
