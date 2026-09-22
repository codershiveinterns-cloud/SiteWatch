"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateProfileAction } from "@/actions/settings";
import { idleForm, type FormState } from "@/lib/validation/form";
import { FormField, FormMessage } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState<FormState<"name">, FormData>(updateProfileAction, idleForm);
  const { push } = useToast();

  React.useEffect(() => {
    if (state.status === "success" && state.message) push({ tone: "success", title: state.message });
  }, [state, push]);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.status === "error" && state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="profile-name" label="Full name" error={state.fieldErrors?.name}>
          {(a) => <Input {...a} name="name" defaultValue={state.values?.name ?? name} autoComplete="name" required />}
        </FormField>
        <FormField id="profile-email" label="Email" hint="Email changes are handled by an Admin.">
          {(a) => <Input {...a} value={email} readOnly disabled />}
        </FormField>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="secondary">Save changes</SubmitButton>
      </div>
    </form>
  );
}
