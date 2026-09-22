// Creates `.session-secret` (32 random bytes, base64url) if it does not exist.
// Used when SESSION_SECRET is not provided via the environment, e.g. on the
// self-contained Vercel deployment. Runs during db:setup and vercel-build.
import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const file = new URL("../.session-secret", import.meta.url);
if (!existsSync(file)) {
  writeFileSync(file, randomBytes(32).toString("base64url"), { mode: 0o600 });
  console.log("Generated .session-secret");
}
