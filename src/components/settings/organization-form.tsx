"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateOrganizationAction } from "@/actions/settings";
import { idleForm, type FormState } from "@/lib/validation/form";
import { FormField, FormMessage } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";

export function OrganizationForm({ name, timezone, readOnly }: { name: string; timezone: string; readOnly: boolean }) {
  const [state, action] = useActionState<FormState<"name" | "timezone">, FormData>(updateOrganizationAction, idleForm);
  const { push } = useToast();

  React.useEffect(() => {
    if (state.status === "success" && state.message) push({ tone: "success", title: state.message });
  }, [state, push]);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.status === "error" && state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="org-name" label="Organization name" error={state.fieldErrors?.name}>
          {(a) => <Input {...a} name="name" defaultValue={state.values?.name ?? name} readOnly={readOnly} disabled={readOnly} required />}
        </FormField>
        <FormField id="org-timezone" label="Timezone" hint="IANA name. Used for SLA timers and reports." error={state.fieldErrors?.timezone}>
          {(a) => (
            <Input {...a} name="timezone" defaultValue={state.values?.timezone ?? timezone} readOnly={readOnly} disabled={readOnly} placeholder="Europe/London" required />
          )}
        </FormField>
      </div>
      {!readOnly ? (
        <div className="flex justify-end">
          <SubmitButton variant="secondary">Save changes</SubmitButton>
        </div>
      ) : null}
    </form>
  );
}
