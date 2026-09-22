"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveSiteAction } from "@/actions/registry";
import { idleForm, type FormState } from "@/lib/validation/form";
import { SITE_CATEGORIES, SITE_CATEGORY_META } from "@/lib/domain";
import { FormField, FormMessage } from "@/components/ui/form-field";
import { Input, Select } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";

type Fields = "name" | "code" | "category" | "latitude" | "longitude" | "address" | "timezone" | "description";

export type SiteFormValues = Partial<Record<Fields, string>>;

export function SiteForm({ siteId, initial, cancelHref }: { siteId: string | null; initial: SiteFormValues; cancelHref: string }) {
  const bound = saveSiteAction.bind(null, siteId);
  const [state, action] = useActionState<FormState<Fields>, FormData>(bound, idleForm);
  const v = { ...initial, ...state.values };

  return (
    <form action={action} noValidate className="space-y-4">
      {state.status === "error" && state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}

      <Panel>
        <PanelHeader title="Site" description="Identity and category" />
        <PanelBody className="grid gap-4 sm:grid-cols-2">
          <FormField id="site-name" label="Site name" error={state.fieldErrors?.name}>
            {(a) => <Input {...a} name="name" defaultValue={v.name} placeholder="Solar array A" required autoFocus />}
          </FormField>
          <FormField id="site-code" label="Site code" hint="Short unique identifier used in imports and telemetry." error={state.fieldErrors?.code}>
            {(a) => <Input {...a} name="code" defaultValue={v.code} placeholder="NW-SOL-01" className="font-mono uppercase" required />}
          </FormField>
          <FormField id="site-category" label="Category" error={state.fieldErrors?.category}>
            {(a) => (
              <Select {...a} name="category" defaultValue={v.category ?? ""} required>
                <option value="" disabled>
                  Choose a category
                </option>
                {SITE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {SITE_CATEGORY_META[c].label}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField id="site-timezone" label="Timezone" optional hint="Defaults to the organization timezone." error={state.fieldErrors?.timezone}>
            {(a) => <Input {...a} name="timezone" defaultValue={v.timezone} placeholder="Europe/London" />}
          </FormField>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader title="Location" description="GPS position used by the map and technician dispatch" />
        <PanelBody className="grid gap-4 sm:grid-cols-2">
          <FormField id="site-lat" label="Latitude" error={state.fieldErrors?.latitude}>
            {(a) => <Input {...a} name="latitude" type="number" step="any" inputMode="decimal" defaultValue={v.latitude} placeholder="52.4120" required />}
          </FormField>
          <FormField id="site-lng" label="Longitude" error={state.fieldErrors?.longitude}>
            {(a) => <Input {...a} name="longitude" type="number" step="any" inputMode="decimal" defaultValue={v.longitude} placeholder="-1.9210" required />}
          </FormField>
          <FormField id="site-address" label="Address" optional className="sm:col-span-2" error={state.fieldErrors?.address}>
            {(a) => <Input {...a} name="address" defaultValue={v.address} placeholder="Nearest road or landmark" />}
          </FormField>
          <FormField id="site-description" label="Notes" optional className="sm:col-span-2" error={state.fieldErrors?.description}>
            {(a) => <Textarea {...a} name="description" defaultValue={v.description} placeholder="Access instructions, contacts, hazards…" />}
          </FormField>
        </PanelBody>
      </Panel>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="secondary">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <SubmitButton>{siteId ? "Save changes" : "Create site"}</SubmitButton>
      </div>
    </form>
  );
}
