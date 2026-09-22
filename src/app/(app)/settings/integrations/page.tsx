import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/guards";
import { tenantDb } from "@/lib/tenant";
import { env } from "@/lib/env";
import { formatDateTime, relativeTime } from "@/lib/utils";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { CreateKeyDialog, RevokeKeyButton } from "@/components/settings/ingest-keys";

export const metadata: Metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const ctx = await requirePermission("telemetry:manage", "/settings/integrations");
  const keys = await tenantDb(ctx.organization.id).ingestKeys.list();
  const endpoint = `${env().APP_URL}/api/ingest/telemetry`;
  const sample = `curl -X POST ${endpoint} \\
  -H "Authorization: Bearer <your ingest key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "events": [
      { "asset_tag": "INV-2", "metric": "power_kw", "value": 96.4, "unit": "kW",
        "recorded_at": "${new Date().toISOString()}" },
      { "asset_tag": "CH-07", "metric": "temperature_c", "value": 65.4, "unit": "°C" }
    ]
  }'`;

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader title="Ingest keys" description="Bearer tokens for the telemetry endpoint. Only a hash is stored." actions={<CreateKeyDialog />} />
        {keys.length === 0 ? (
          <PanelBody>
            <p className="text-sm text-ink-3">No keys yet. Create one to start sending telemetry.</p>
          </PanelBody>
        ) : (
          <ul className="divide-y divide-line">
            {keys.map((k) => (
              <li key={k.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    {k.name}
                    {k.revokedAt ? <Badge tone="neutral">Revoked</Badge> : <Badge tone="healthy">Active</Badge>}
                  </p>
                  <p className="font-mono text-2xs text-ink-3">
                    {k.keyPrefix}… · created {formatDateTime(k.createdAt)}
                    {k.lastUsedAt ? ` · last used ${relativeTime(k.lastUsedAt)}` : " · never used"}
                  </p>
                </div>
                {!k.revokedAt ? <RevokeKeyButton keyId={k.id} name={k.name} /> : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelHeader title="Telemetry ingestion API" description="Send readings from sensors, gateways or third-party monitoring" />
        <PanelBody className="space-y-4">
          <div>
            <p className="eyebrow mb-1">Endpoint</p>
            <code className="block overflow-x-auto rounded-md border border-line bg-sunken px-3 py-2 font-mono text-xs text-ink">POST {endpoint}</code>
          </div>
          <div>
            <p className="eyebrow mb-1">Example</p>
            <pre className="overflow-x-auto rounded-md border border-line bg-sunken p-3 font-mono text-xs leading-relaxed text-ink">{sample}</pre>
          </div>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
            <dt className="font-mono text-xs text-ink-3">asset_tag</dt>
            <dd className="text-ink-2">Tag of a registered asset in your organization. Unknown tags are rejected and logged.</dd>
            <dt className="font-mono text-xs text-ink-3">metric</dt>
            <dd className="text-ink-2">snake_case metric name, e.g. power_kw, temperature_c, battery_soc_pct.</dd>
            <dt className="font-mono text-xs text-ink-3">value</dt>
            <dd className="text-ink-2">Number. <span className="font-mono text-xs">unit</span> is optional.</dd>
            <dt className="font-mono text-xs text-ink-3">recorded_at</dt>
            <dd className="text-ink-2">ISO 8601 timestamp; defaults to the time received. Future timestamps are rejected.</dd>
            <dt className="font-mono text-xs text-ink-3">Responses</dt>
            <dd className="text-ink-2">
              <span className="font-mono text-xs">202</span> accepted (with per-event rejections listed), <span className="font-mono text-xs">422</span> nothing accepted,{" "}
              <span className="font-mono text-xs">401</span> bad key, <span className="font-mono text-xs">400</span> invalid JSON. Up to 500 events per request.
            </dd>
          </dl>
        </PanelBody>
      </Panel>
    </div>
  );
}
