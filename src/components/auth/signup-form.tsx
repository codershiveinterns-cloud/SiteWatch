"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/actions/auth";
import { idleForm, type FormState } from "@/lib/validation/form";
import { FormField, FormMessage } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { PasswordInput } from "./password-input";

type Fields = "name" | "email" | "password" | "organizationName";

export function SignupForm() {
  const [state, action] = useActionState<FormState<Fields>, FormData>(signUpAction, idleForm);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.status === "error" && state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}

      <FormField id="organizationName" label="Organization" hint="Your company or operating entity. This becomes your isolated workspace." error={state.fieldErrors?.organizationName}>
        {(a) => (
          <Input {...a} name="organizationName" autoComplete="organization" defaultValue={state.values?.organizationName} placeholder="Northwind Renewables" required autoFocus />
        )}
      </FormField>

      <FormField id="name" label="Your name" error={state.fieldErrors?.name}>
        {(a) => <Input {...a} name="name" autoComplete="name" defaultValue={state.values?.name} placeholder="Amara Okafor" required />}
      </FormField>

      <FormField id="email" label="Work email" error={state.fieldErrors?.email}>
        {(a) => (
          <Input
            {...a}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={state.values?.email}
            placeholder="you@company.com"
            required
          />
        )}
      </FormField>

      <FormField id="password" label="Password" hint="At least 10 characters with a letter and a number." error={state.fieldErrors?.password}>
        {(a) => <PasswordInput {...a} name="password" autoComplete="new-password" required />}
      </FormField>

      <SubmitButton size="lg" className="w-full">
        Create workspace
      </SubmitButton>

      <p className="text-center text-xs leading-relaxed text-ink-3">
        You will be the Admin of this organization and can add teammates and assign roles from the Team page.
      </p>

      <p className="text-center text-sm text-ink-3">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent-text hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
