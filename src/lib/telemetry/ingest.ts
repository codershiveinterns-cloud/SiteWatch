import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { telemetryEventSchema } from "@/lib/validation/registry";
import { z } from "zod";

const batchSchema = z.object({ events: z.array(telemetryEventSchema).min(1, "events must contain at least one event").max(500, "at most 500 events per request") });

export const INGEST_KEY_PREFIX = "sw_ingest_";

export function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Generates a new raw key; only its hash is persisted. */
export function generateIngestKey(): { raw: string; prefix: string; hash: string } {
  const raw = `${INGEST_KEY_PREFIX}${randomBytes(24).toString("base64url")}`;
  return { raw, prefix: raw.slice(0, 18), hash: hashKey(raw) };
}

type Batch = { events: z.infer<typeof telemetryEventSchema>[] };
function wrapSingle(r: z.ZodSafeParseResult<z.infer<typeof telemetryEventSchema>>): z.ZodSafeParseResult<Batch> {
  return r.success ? { success: true, data: { events: [r.data] } } : (r as unknown as z.ZodSafeParseResult<Batch>);
}

export type IngestResult = {
  accepted: number;
  rejected: Array<{ index: number; reason: string }>;
};

/** Resolves an ingest key to its organization, or null when unknown/revoked. */
export async function authenticateIngestKey(raw: string | null) {
  if (!raw || !raw.startsWith(INGEST_KEY_PREFIX)) return null;
  const key = await db.ingestKey.findUnique({ where: { keyHash: hashKey(raw) } });
  if (!key || key.revokedAt) return null;
  void db.ingestKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => undefined);
  return key;
}

/**
 * Validates and stores a telemetry payload for one organization. Malformed
 * events are rejected individually (recorded in RejectedEvent) so one bad
 * reading never blocks a batch. Returns counts for the API response.
 */
export async function ingestTelemetry(organizationId: string, ingestKeyId: string, body: unknown, source: string | null): Promise<IngestResult> {
  const isBatch = typeof body === "object" && body !== null && "events" in body;
  const parsed = isBatch ? batchSchema.safeParse(body) : wrapSingle(telemetryEventSchema.safeParse(body));
  if (!parsed.success) {
    const reason = parsed.error.issues.map((i) => `${i.path.join(".") || "payload"}: ${i.message}`).slice(0, 5).join("; ");
    await db.rejectedEvent.create({
      data: { organizationId, ingestKeyId, reason, payload: JSON.stringify(body).slice(0, 2000) },
    });
    return { accepted: 0, rejected: [{ index: -1, reason }] };
  }

  const events = parsed.data.events;
  const tags = [...new Set(events.map((e) => e.asset_tag.toUpperCase()))];
  const assets = await db.asset.findMany({ where: { organizationId, tag: { in: tags } }, select: { id: true, tag: true } });
  const byTag = new Map(assets.map((a) => [a.tag, a.id]));

  const rows: Array<{ organizationId: string; assetId: string; metric: string; value: number; unit: string | null; recordedAt: Date; source: string | null }> = [];
  const rejected: IngestResult["rejected"] = [];
  const latestByAsset = new Map<string, Date>();

  events.forEach((e, index) => {
    const assetId = byTag.get(e.asset_tag.toUpperCase());
    if (!assetId) {
      rejected.push({ index, reason: `unknown asset_tag "${e.asset_tag}"` });
      return;
    }
    if (e.recorded_at.getTime() > Date.now() + 5 * 60 * 1000) {
      rejected.push({ index, reason: "recorded_at is in the future" });
      return;
    }
    rows.push({ organizationId, assetId, metric: e.metric, value: e.value, unit: e.unit ?? null, recordedAt: e.recorded_at, source });
    const prev = latestByAsset.get(assetId);
    if (!prev || e.recorded_at > prev) latestByAsset.set(assetId, e.recorded_at);
  });

  if (rows.length > 0) {
    await db.telemetryEvent.createMany({ data: rows });
    await Promise.all(
      [...latestByAsset.entries()].map(([assetId, at]) =>
        db.asset.updateMany({ where: { id: assetId, OR: [{ lastTelemetryAt: null }, { lastTelemetryAt: { lt: at } }] }, data: { lastTelemetryAt: at } }),
      ),
    );
  }

  if (rejected.length > 0) {
    await db.rejectedEvent.createMany({
      data: rejected.map((r) => ({
        organizationId,
        ingestKeyId,
        reason: r.reason,
        payload: JSON.stringify(r.index >= 0 ? events[r.index] : body).slice(0, 2000),
      })),
    });
  }

  return { accepted: rows.length, rejected };
}
