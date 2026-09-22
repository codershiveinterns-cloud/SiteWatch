import type { Metadata } from "next";
import Link from "next/link";
import { Activity, KeyRound } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/rbac";
import { tenantDb } from "@/lib/tenant";
import { metricLabel, metricUnit } from "@/lib/domain";
import { daysFromNow, formatDateTime, relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/shell/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { StatusIndicator } from "@/components/ui/status-indicator";

export const metadata: Metadata = { title: "Telemetry" };

export default async function TelemetryPage() {
  const ctx = await requirePermission("telemetry:view", "/telemetry");
  const tenant = tenantDb(ctx.organization.id);
  const dayAgo = daysFromNow(-1);
  const [recent, rejected, total, last24h, keys, assetsReporting, assetsTotal] = await Promise.all([
    tenant.telemetry.recent(60),
    tenant.telemetry.rejected(20),
    tenant.telemetry.count(),
    tenant.telemetry.countSince(dayAgo),
    tenant.ingestKeys.list(),
    tenant.assets.count({ lastTelemetryAt: { gte: dayAgo } }),
    tenant.assets.count(),
  ]);
  const activeKeys = keys.filter((k) => !k.revokedAt).length;
  const canManage = hasPermission(ctx.role, "telemetry:manage");

  return (
    <>
      <PageHeader
        eyebrow="Monitoring"
        title="Telemetry"
        description="Readings arriving from sensor feeds and third-party monitoring through the ingestion API."
        actions={
          canManage ? (
            <Button asChild variant="secondary">
              <Link href="/settings/integrations">
                <KeyRound className="size-3.5" aria-hidden /> Ingest keys & API
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Events · 24 h", last24h.toLocaleString()],
          ["Events · total", total.toLocaleString()],
          ["Assets reporting · 24 h", `${assetsReporting} / ${assetsTotal}`],
          ["Active ingest keys", String(activeKeys)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md border border-line bg-surface px-3 py-2.5 shadow-sm">
            <p className="text-xs text-ink-3">{k}</p>
            <p className="mt-0.5 text-lg font-semibold tabular text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Live stream"
            description="Most recent 60 accepted readings"
            actions={<StatusIndicator tone={last24h > 0 ? "healthy" : "neutral"} label={last24h > 0 ? "Receiving" : "Idle"} pulse={last24h > 0} />}
          />
          {recent.length === 0 ? (
            <PanelBody>
              <EmptyState compact icon={<Activity className="size-4" />} title="No readings yet" description="Post events to the ingestion endpoint to see them here." />
            </PanelBody>
          ) : (
            <Table>
              <THead>
                <TH>Received</TH>
                <TH>Asset</TH>
                <TH>Metric</TH>
                <TH className="text-right">Value</TH>
              </THead>
              <tbody>
                {recent.map((e) => (
                  <TR key={e.id}>
                    <TD className="whitespace-nowrap font-mono text-xs text-ink-2" title={formatDateTime(e.receivedAt)}>
                      {relativeTime(e.receivedAt)}
                    </TD>
                    <TD>
                      <Link href={`/assets/${e.asset.id}`} className="hover:underline underline-offset-4">
                        <span className="font-mono text-xs text-ink">{e.asset.tag}</span>
                        <span className="ml-2 text-xs text-ink-3">{e.asset.name}</span>
                      </Link>
                    </TD>
                    <TD className="text-ink-2">{metricLabel(e.metric)}</TD>
                    <TD className="text-right font-mono tabular text-ink">
                      {e.value} {metricUnit(e.metric, e.unit)}
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Rejected payloads" description="Malformed or unmatched events are logged, never silently dropped" />
          {rejected.length === 0 ? (
            <PanelBody>
              <p className="text-sm text-ink-3">Nothing rejected recently.</p>
            </PanelBody>
          ) : (
            <ul className="divide-y divide-line">
              {rejected.map((r) => (
                <li key={r.id} className="px-4 py-3">
                  <p className="text-xs font-medium text-critical-text">{r.reason}</p>
                  <p className="mt-1 truncate font-mono text-2xs text-ink-3">{r.payload}</p>
                  <p className="mt-1 font-mono text-2xs text-ink-3">{formatDateTime(r.receivedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
