import { NextResponse, type NextRequest } from "next/server";
import { authenticateIngestKey, ingestTelemetry } from "@/lib/telemetry/ingest";

export const dynamic = "force-dynamic";

/**
 * POST /api/ingest/telemetry
 *
 * Authorization: Bearer <ingest key>   (create keys under Settings → Integrations)
 * Body: { "events": [ { "asset_tag": "INV-2", "metric": "power_kw", "value": 96.4,
 *                       "unit": "kW", "recorded_at": "2026-09-22T09:14:02Z" } ] }
 * A single event object is also accepted.
 *
 * Responses: 202 with { accepted, rejected[] }; 401 unknown/revoked key;
 * 400 unparseable JSON; 413 too many events.
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const raw = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const key = await authenticateIngestKey(raw);
  if (!key) {
    return NextResponse.json({ error: "Invalid or revoked ingest key" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 });
  }

  const result = await ingestTelemetry(key.organizationId, key.id, body, request.headers.get("x-source") ?? "api");
  const status = result.accepted === 0 && result.rejected.length > 0 ? 422 : 202;
  return NextResponse.json(result, { status });
}

export function GET() {
  return NextResponse.json(
    {
      endpoint: "POST /api/ingest/telemetry",
      auth: "Authorization: Bearer <ingest key>",
      body: { events: [{ asset_tag: "INV-2", metric: "power_kw", value: 96.4, unit: "kW", recorded_at: "2026-09-22T09:14:02Z" }] },
    },
    { status: 405 },
  );
}
