import * as React from "react";
import { cn } from "@/lib/utils";
import { inputClass } from "./input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(inputClass, "h-auto min-h-24 py-2 leading-relaxed", className)} {...props} />;
  },
);
