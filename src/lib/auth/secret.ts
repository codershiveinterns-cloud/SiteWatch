import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

let cached: Buffer | undefined;

/**
 * Secret used to sign session cookies. Resolution order:
 * 1. SESSION_SECRET environment variable
 * 2. `.session-secret` file in the project root (generated at build/setup)
 * 3. In development only, a file is generated on first use.
 */
export function sessionSecret(): Buffer {
  if (cached) return cached;
  const fromEnv = process.env.SESSION_SECRET?.trim();
  if (fromEnv) {
    cached = Buffer.from(fromEnv, "utf8");
    return cached;
  }
  const file = path.resolve(process.cwd(), ".session-secret");
  if (fs.existsSync(file)) {
    cached = Buffer.from(fs.readFileSync(file, "utf8").trim(), "utf8");
    return cached;
  }
  if (process.env.NODE_ENV !== "production") {
    const generated = randomBytes(32).toString("base64url");
    fs.writeFileSync(file, generated, { mode: 0o600 });
    cached = Buffer.from(generated, "utf8");
    return cached;
  }
  throw new Error("SESSION_SECRET is not set and .session-secret was not generated at build time.");
}
