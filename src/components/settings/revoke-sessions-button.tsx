"use client";

import * as React from "react";
import { revokeOtherSessionsAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function RevokeSessionsButton({ count }: { count: number }) {
  const [pending, start] = React.useTransition();
  const { push } = useToast();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={count === 0}
      loading={pending}
      onClick={() =>
        start(async () => {
          const r = await revokeOtherSessionsAction();
          push({ tone: r.status === "success" ? "success" : "error", title: r.message ?? "Done" });
        })
      }
    >
      Sign out other devices{count > 0 ? ` (${count})` : ""}
    </Button>
  );
}
