"use client";

import * as React from "react";
import { DropdownMenu as Primitive } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;
export const DropdownMenuRadioGroup = Primitive.RadioGroup;

export function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          "z-50 min-w-[12rem] rounded-md border border-line bg-surface p-1 text-sm shadow-md animate-fade-in focus:outline-none",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

const itemClass =
  "relative flex min-h-9 cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm text-ink outline-none data-[highlighted]:bg-sunken data-[disabled]:opacity-50 data-[disabled]:pointer-events-none";

export function DropdownMenuItem({ className, destructive, ...props }: React.ComponentProps<typeof Primitive.Item> & { destructive?: boolean }) {
  return <Primitive.Item className={cn(itemClass, destructive && "text-critical-text data-[highlighted]:bg-critical-soft", className)} {...props} />;
}

export function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof Primitive.RadioItem>) {
  return (
    <Primitive.RadioItem className={cn(itemClass, "pr-8", className)} {...props}>
      {children}
      <Primitive.ItemIndicator className="absolute right-2 text-accent">
        <Check className="size-3.5" />
      </Primitive.ItemIndicator>
    </Primitive.RadioItem>
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof Primitive.Label>) {
  return <Primitive.Label className={cn("px-2 py-1.5 eyebrow", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cn("-mx-1 my-1 h-px bg-line", className)} {...props} />;
}
