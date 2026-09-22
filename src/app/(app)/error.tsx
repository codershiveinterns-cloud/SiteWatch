"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-10">
      <ErrorState
        title="This page failed to load"
        description="The request hit an unexpected error. Retry, or return to the dashboard. If it keeps happening, share the reference below with support."
        reference={error.digest}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => reset()}>
              Try again
            </Button>
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
