"use client";

import * as React from "react";
import { useActionState } from "react";
import { Copy, KeyRound } from "lucide-react";
import { createIngestKeyAction, revokeIngestKeyAction, type CreateKeyState } from "@/actions/ingest-keys";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { FormField, FormMessage } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { useToast } from "@/components/ui/toast";

export function CreateKeyDialog() {
  const [open, setOpen] = React.useState(false);
  const [state, action] = useActionState<CreateKeyState, FormData>(createIngestKeyAction, { status: "idle" });
  const { push } = useToast();
  const created = state.status === "success" && state.rawKey;

  const copy = async () => {
    if (!state.rawKey) return;
    try {
      await navigator.clipboard.writeText(state.rawKey);
      push({ tone: "success", title: "Key copied" });
    } catch {
      push({ tone: "error", title: "Could not copy", description: "Select the key and copy it manually." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <KeyRound className="size-3.5" aria-hidden /> New key
        </Button>
      </DialogTrigger>
      <DialogContent
        title={created ? "Key created" : "Create an ingest key"}
        description={created ? "Copy it now. For security the full key is shown only once." : "Each feed or integration should have its own key so it can be revoked independently."}
      >
        {created ? (
          <div className="space-y-4">
            <FormMessage tone="success">Use this key as a Bearer token for {state.keyName}.</FormMessage>
            <div className="flex items-center gap-2">
              <code className="flex h-10 min-w-0 flex-1 items-center overflow-x-auto rounded-md border border-line bg-sunken px-3 font-mono text-xs text-ink select-all">
                {state.rawKey}
              </code>
              <Button variant="secondary" size="icon" onClick={copy} aria-label="Copy key">
                <Copy className="size-4" />
              </Button>
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
            <FormField id="key-name" label="Key name" error={state.fieldErrors?.name}>
              {(a) => <Input {...a} name="name" placeholder="SCADA gateway · North grid" defaultValue={state.values?.name} required autoFocus />}
            </FormField>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <SubmitButton>Create key</SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function RevokeKeyButton({ keyId, name }: { keyId: string; name: string }) {
  const { push } = useToast();
  return (
    <ConfirmButton
      variant="ghost"
      size="sm"
      title={`Revoke "${name}"?`}
      description="Feeds using this key will receive 401 responses immediately. This cannot be undone."
      confirmLabel="Revoke key"
      action={async () => {
        const r = await revokeIngestKeyAction(keyId);
        if (r.status === "success") push({ tone: "success", title: r.message ?? "Key revoked" });
        return r;
      }}
    >
      Revoke
    </ConfirmButton>
  );
}
