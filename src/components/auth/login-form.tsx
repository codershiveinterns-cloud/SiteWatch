"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "@/actions/auth";
import { idleForm, type FormState } from "@/lib/validation/form";
import { FormField, FormMessage } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { PasswordInput } from "./password-input";

type Fields = "email" | "password";

export function LoginForm({ next, notice }: { next?: string; notice?: { tone: "info" | "success" | "error"; text: string } }) {
  const [state, action] = useActionState<FormState<Fields>, FormData>(signInAction, idleForm);

  return (
    <form action={action} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state.status === "error" && state.message ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : notice ? (
        <FormMessage tone={notice.tone}>{notice.text}</FormMessage>
      ) : null}

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
            autoFocus
          />
        )}
      </FormField>

      <FormField id="password" label="Password" error={state.fieldErrors?.password}>
        {(a) => <PasswordInput {...a} name="password" autoComplete="current-password" required />}
      </FormField>

      <SubmitButton size="lg" className="w-full">
        Sign in
      </SubmitButton>

      <p className="text-center text-sm text-ink-3">
        New organization?{" "}
        <Link href="/signup" className="font-medium text-accent-text hover:underline underline-offset-4">
          Create a workspace
        </Link>
      </p>
    </form>
  );
}
