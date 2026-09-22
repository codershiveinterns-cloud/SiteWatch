"use client";

import * as React from "react";
import { useActionState } from "react";
import { changePasswordAction } from "@/actions/settings";
import { idleForm, type FormState } from "@/lib/validation/form";
import { FormField, FormMessage } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { PasswordInput } from "@/components/auth/password-input";
import { useToast } from "@/components/ui/toast";

type Fields = "currentPassword" | "newPassword" | "confirmPassword";

export function ChangePasswordForm() {
  const [state, action] = useActionState<FormState<Fields>, FormData>(changePasswordAction, idleForm);
  const { push } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.status === "success" && state.message) {
      push({ tone: "success", title: state.message });
      formRef.current?.reset();
    }
  }, [state, push]);

  return (
    <form ref={formRef} action={action} className="space-y-4" noValidate>
      {state.status === "error" && state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <FormField id="current-password" label="Current password" error={state.fieldErrors?.currentPassword} className="max-w-sm">
        {(a) => <PasswordInput {...a} name="currentPassword" autoComplete="current-password" required />}
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="new-password" label="New password" hint="At least 10 characters with a letter and a number." error={state.fieldErrors?.newPassword}>
          {(a) => <PasswordInput {...a} name="newPassword" autoComplete="new-password" required />}
        </FormField>
        <FormField id="confirm-password" label="Confirm new password" error={state.fieldErrors?.confirmPassword}>
          {(a) => <PasswordInput {...a} name="confirmPassword" autoComplete="new-password" required />}
        </FormField>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="secondary">Change password</SubmitButton>
      </div>
    </form>
  );
}
