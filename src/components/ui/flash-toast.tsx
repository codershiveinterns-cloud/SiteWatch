"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "./toast";

/** Shows a toast once when `?param=1` is present, then removes it from the URL. */
export function FlashToast({ param, message, tone = "success" }: { param: string; message: string; tone?: "success" | "info" | "error" }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { push } = useToast();
  const shown = React.useRef(false);

  React.useEffect(() => {
    if (shown.current || searchParams.get(param) !== "1") return;
    shown.current = true;
    push({ tone, title: message });
    const next = new URLSearchParams(searchParams.toString());
    next.delete(param);
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [searchParams, param, message, tone, push, router, pathname]);

  return null;
}
