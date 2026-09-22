"use client";

import * as React from "react";
import { useActionState } from "react";
import { Copy, UserPlus } from "lucide-react";
import { addMemberAction } from "@/actions/team";
import { idleForm, type FormState } from "@/lib/validation/form";
import { ROLE_META, ROLE_ORDER } from "@/lib/rbac/roles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { FormField, FormMessage } from "@/components/ui/form-field";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";

type Fields = "name" | "email" | "role";
type State = FormState<Fields> & { temporaryPassword?: string; memberName?: string };

export function AddMemberDialog() {
  const [open, setOpen] = React.useState(false);
  const [state, action] = useActionState<State, FormData>(addMemberAction, idleForm);
  const { push } = useToast();
  const [copied, setCopied] = React.useState(false);

  const created = state.status === "success" && state.temporaryPassword;

  const copy = async () => {
    if (!state.temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(state.temporaryPassword);
      setCopied(true);
      push({ tone: "success", title: "Temporary password copied" });
    } catch {
      push({ tone: "error", title: "Could not copy", description: "Select the password and copy it manually." });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setCopied(false);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" aria-hidden /> Add member
        </Button>
      </DialogTrigger>
      <DialogContent
        title={created ? "Member added" : "Add a member"}
        description={
          created
            ? "Share the temporary password securely. It is shown once; the member can change it under Settings → Security."
            : "Creates an account in this organization. Email invitations arrive with the notification engine in Milestone 4."
        }
      >
        {created ? (
          <div className="space-y-4">
            <FormMessage tone="success">{state.memberName} can now sign in with their email address.</FormMessage>
            <div>
              <p className="text-sm font-medium text-ink">Temporary password</p>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="flex h-10 flex-1 items-center rounded-md border border-line bg-sunken px-3 font-mono text-sm tracking-wide text-ink select-all">
                  {state.temporaryPassword}
                </code>
                <Button variant="secondary" size="icon" onClick={copy} aria-label="Copy temporary password">
                  <Copy className="size-4" />
                </Button>
              </div>
              {copied ? <p className="mt-1 text-xs text-healthy-text">Copied to clipboard.</p> : null}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        ) : (
          <form action={action} className="space-y-4" noValidate>
            {state.status === "error" && state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}
            <FormField id="member-name" label="Full name" error={state.fieldErrors?.name}>
              {(a) => <Input {...a} name="name" autoComplete="off" defaultValue={state.values?.name} required autoFocus />}
            </FormField>
            <FormField id="member-email" label="Work email" error={state.fieldErrors?.email}>
              {(a) => <Input {...a} name="email" type="email" autoComplete="off" inputMode="email" defaultValue={state.values?.email} required />}
            </FormField>
            <FormField id="member-role" label="Role" error={state.fieldErrors?.role}>
              {(a) => (
                <Select {...a} name="role" defaultValue={state.values?.role ?? "VIEWER"}>
                  {ROLE_ORDER.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_META[r].label} — {ROLE_META[r].description}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <SubmitButton>Add member</SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
