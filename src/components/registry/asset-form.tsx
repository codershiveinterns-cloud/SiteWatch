"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { saveAssetAction } from "@/actions/registry";
import { idleForm, type FormState } from "@/lib/validation/form";
import { ASSET_STATUSES, ASSET_STATUS_META, SITE_CATEGORY_META, type SiteCategory } from "@/lib/domain";
import { FormField, FormMessage } from "@/components/ui/form-field";
import { Input, Select } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";

type Fields =
  | "siteId" | "name" | "tag" | "type" | "manufacturer" | "model" | "serialNumber" | "installDate"
  | "status" | "criticality" | "specifications" | "maintenanceIntervalDays" | "lastMaintenanceAt";

export type AssetFormValues = Partial<Record<Fields, string>>;
export type SiteOption = { id: string; name: string; code: string; category: SiteCategory };

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AssetForm({ assetId, initial, sites, cancelHref }: { assetId: string | null; initial: AssetFormValues; sites: SiteOption[]; cancelHref: string }) {
  const bound = saveAssetAction.bind(null, assetId);
  const [state, action] = useActionState<FormState<Fields>, FormData>(bound, idleForm);
  const v = { ...initial, ...state.values };
  const [siteId, setSiteId] = React.useState(v.siteId ?? "");
  const site = sites.find((s) => s.id === siteId);
  const suggestions = site ? SITE_CATEGORY_META[site.category].assetTypes : [];

  return (
    <form action={action} noValidate className="space-y-4">
      {state.status === "error" && state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}

      <Panel>
        <PanelHeader title="Asset" description="Identity, site and type" />
        <PanelBody className="grid gap-4 sm:grid-cols-2">
          <FormField id="asset-site" label="Site" error={state.fieldErrors?.siteId}>
            {(a) => (
              <Select {...a} name="siteId" value={siteId} onChange={(e) => setSiteId(e.target.value)} required>
                <option value="" disabled>
                  Choose a site
                </option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.code}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField id="asset-tag" label="Asset tag" hint="Unique in your organization; telemetry payloads reference it." error={state.fieldErrors?.tag}>
            {(a) => <Input {...a} name="tag" defaultValue={v.tag} placeholder="INV-2" className="font-mono uppercase" required />}
          </FormField>
          <FormField id="asset-name" label="Asset name" error={state.fieldErrors?.name}>
            {(a) => <Input {...a} name="name" defaultValue={v.name} placeholder="Backup inverter" required />}
          </FormField>
          <FormField id="asset-type" label="Type" hint={suggestions.length ? `Suggested: ${suggestions.slice(0, 4).join(", ")}` : undefined} error={state.fieldErrors?.type}>
            {(a) => (
              <>
                <Input {...a} name="type" defaultValue={v.type} placeholder="Inverter" list="asset-type-suggestions" required />
                <datalist id="asset-type-suggestions">
                  {suggestions.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </>
            )}
          </FormField>
          <FormField id="asset-status" label="Status" error={state.fieldErrors?.status}>
            {(a) => (
              <Select {...a} name="status" defaultValue={v.status ?? "UNKNOWN"}>
                {ASSET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ASSET_STATUS_META[s].label}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField id="asset-criticality" label="Criticality" hint="Drives incident priority and ranking." error={state.fieldErrors?.criticality}>
            {(a) => (
              <Select {...a} name="criticality" defaultValue={v.criticality ?? "MEDIUM"}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            )}
          </FormField>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader title="Master data" description="Manufacturer details and specifications" />
        <PanelBody className="grid gap-4 sm:grid-cols-3">
          <FormField id="asset-manufacturer" label="Manufacturer" optional error={state.fieldErrors?.manufacturer}>
            {(a) => <Input {...a} name="manufacturer" defaultValue={v.manufacturer} />}
          </FormField>
          <FormField id="asset-model" label="Model" optional error={state.fieldErrors?.model}>
            {(a) => <Input {...a} name="model" defaultValue={v.model} />}
          </FormField>
          <FormField id="asset-serial" label="Serial number" optional error={state.fieldErrors?.serialNumber}>
            {(a) => <Input {...a} name="serialNumber" defaultValue={v.serialNumber} className="font-mono" />}
          </FormField>
          <FormField id="asset-install" label="Install date" optional error={state.fieldErrors?.installDate}>
            {(a) => <Input {...a} name="installDate" type="date" max={todayIso()} defaultValue={v.installDate} />}
          </FormField>
          <FormField id="asset-specs" label="Specifications" optional hint='JSON object, e.g. {"rated_kw": 100, "phases": 3}' className="sm:col-span-2" error={state.fieldErrors?.specifications}>
            {(a) => <Textarea {...a} name="specifications" defaultValue={v.specifications} className="font-mono text-xs" placeholder='{"rated_kw": 100}' />}
          </FormField>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader title="Maintenance schedule" description="The next due date is calculated from the last service and the interval" />
        <PanelBody className="grid gap-4 sm:grid-cols-2">
          <FormField id="asset-interval" label="Service interval (days)" optional error={state.fieldErrors?.maintenanceIntervalDays}>
            {(a) => <Input {...a} name="maintenanceIntervalDays" type="number" min={1} max={3650} inputMode="numeric" defaultValue={v.maintenanceIntervalDays} placeholder="180" />}
          </FormField>
          <FormField id="asset-last-maint" label="Last serviced" optional error={state.fieldErrors?.lastMaintenanceAt}>
            {(a) => <Input {...a} name="lastMaintenanceAt" type="date" max={todayIso()} defaultValue={v.lastMaintenanceAt} />}
          </FormField>
        </PanelBody>
      </Panel>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="secondary">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <SubmitButton>{assetId ? "Save changes" : "Create asset"}</SubmitButton>
      </div>
    </form>
  );
}
