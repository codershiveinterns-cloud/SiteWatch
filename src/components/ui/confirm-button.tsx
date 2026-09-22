"use client";

import * as React from "react";
import { Button, type ButtonProps } from "./button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "./dialog";
import { useToast } from "./toast";
import type { FormState } from "@/lib/validation/form";

/**
 * Button that asks for confirmation in a dialog before running a server
 * action. The action may redirect; if it returns an error it is toasted.
 */
export function ConfirmButton({
  title,
  description,
  confirmLabel = "Confirm",
  action,
  children,
  ...props
}: ButtonProps & {
  title: string;
  description: string;
  confirmLabel?: string;
  action: () => Promise<FormState | void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, start] = React.useTransition();
  const { push } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...props}>{children}</Button>
      </DialogTrigger>
      <DialogContent title={title} description={description} size="sm">
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            variant="danger"
            loading={pending}
            onClick={() =>
              start(async () => {
                const result = await action();
                if (result && result.status === "error") {
                  push({ tone: "error", title: result.message ?? "Action failed" });
                  setOpen(false);
                }
              })
            }
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
