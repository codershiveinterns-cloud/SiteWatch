import type { z } from "zod";

/** Standard shape returned by every form-handling server action. */
export type FormState<TFields extends string = string> = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<TFields, string>>;
  values?: Partial<Record<TFields, string>>;
};

export const idleForm: FormState = { status: "idle" };

export function fieldErrorsFromZod<T extends string>(error: z.ZodError): Partial<Record<T, string>> {
  const out: Partial<Record<T, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) out[key as T] = issue.message;
  }
  return out;
}

export function formValues(formData: FormData, keys: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = formData.get(k);
    if (typeof v === "string") out[k] = v;
  }
  return out;
}
