"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#industries", label: "Industries" },
  { href: "#security", label: "Security" },
];

function subscribe(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

export function SiteNav({ signedIn }: { signedIn: boolean }) {
  const scrolled = React.useSyncExternalStore(
    subscribe,
    () => window.scrollY > 12,
    () => false,
  );
  const [open, setOpen] = React.useState(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,box-shadow] duration-200",
        scrolled ? "border-b border-line bg-canvas/85 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-canvas/70" : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-m flex h-16 items-center justify-between gap-4">
        <Link href="/" className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" aria-label="SiteWatch home">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="flex h-9 items-center rounded-md px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <Button asChild>
              <Link href="/dashboard">
                Open console <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger
            className="-mr-2 flex size-11 items-center justify-center rounded-md text-ink-2 hover:bg-sunken hover:text-ink md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay animate-overlay-in md:hidden" />
            <DialogPrimitive.Content
              aria-describedby={undefined}
              className="fixed inset-x-0 top-0 z-50 flex max-h-dvh flex-col overflow-y-auto border-b border-line bg-canvas shadow-lg animate-fade-in focus:outline-none md:hidden"
            >
              <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
              <div className="container-m flex h-16 items-center justify-between">
                <Wordmark />
                <DialogPrimitive.Close className="-mr-2 flex size-11 items-center justify-center rounded-md text-ink-2 hover:bg-sunken hover:text-ink" aria-label="Close menu">
                  <X className="size-5" />
                </DialogPrimitive.Close>
              </div>
              <nav aria-label="Mobile" className="container-m pb-6">
                <ul className="divide-y divide-line border-y border-line">
                  {LINKS.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} onClick={() => setOpen(false)} className="flex h-13 items-center justify-between text-md font-medium text-ink">
                        {l.label}
                        <ArrowRight className="size-4 text-ink-3" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 grid gap-2">
                  {signedIn ? (
                    <Button asChild size="lg">
                      <Link href="/dashboard">Open console</Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild size="lg">
                        <Link href="/signup">Get started</Link>
                      </Button>
                      <Button asChild size="lg" variant="secondary">
                        <Link href="/login">Sign in</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </header>
  );
}
