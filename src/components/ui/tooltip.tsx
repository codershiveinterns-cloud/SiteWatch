"use client";

import * as React from "react";
import { Tooltip as Primitive } from "radix-ui";

export const TooltipProvider = Primitive.Provider;

export function Tooltip({ content, children, side = "right" }: { content: React.ReactNode; children: React.ReactNode; side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <Primitive.Root delayDuration={300}>
      <Primitive.Trigger asChild>{children}</Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          side={side}
          sideOffset={8}
          className="z-50 rounded-md bg-ink px-2 py-1 text-xs font-medium text-ink-inverse shadow-md animate-fade-in"
        >
          {content}
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
