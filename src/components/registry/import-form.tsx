"use client";

import { useActionState } from "react";
import { importAssetsAction, type ImportResult } from "@/actions/registry";
import { FormField, FormMessage } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { inputClass } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ImportForm() {
  const [state, action] = useActionState<ImportResult, FormData>(importAssetsAction, { status: "idle" });
  return (
    <form action={action} className="space-y-4">
      {state.status === "error" && state.message ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      {state.status === "success" && state.message ? <FormMessage tone="success">{state.message}</FormMessage> : null}
      <FormField id="csv" label="CSV file" hint="Up to 2 MB. Rows with problems are skipped and listed below; nothing else is affected.">
        {(a) => <input {...a} type="file" name="file" accept=".csv,text/csv" required className={cn(inputClass, "file:mr-3 file:rounded-sm file:border-0 file:bg-sunken file:px-2 file:py-1 file:text-xs file:font-medium file:text-ink")} />}
      </FormField>
      <SubmitButton>Import assets</SubmitButton>
      {state.skipped && state.skipped.length > 0 ? (
        <div className="rounded-md border border-atrisk/30 bg-atrisk-soft/50 p-3">
          <p className="text-xs font-semibold text-atrisk-text">Skipped rows</p>
          <ul className="mt-1.5 space-y-1 font-mono text-2xs text-ink-2">
            {state.skipped.slice(0, 25).map((s) => (
              <li key={s.line}>
                line {s.line}: {s.reason}
              </li>
            ))}
            {state.skipped.length > 25 ? <li>…and {state.skipped.length - 25} more</li> : null}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
