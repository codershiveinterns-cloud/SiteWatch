"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { signOutAction } from "@/actions/auth";
import type { Role } from "@/lib/rbac/roles";
import { ThemeMenuGroup } from "./theme-toggle";
import type { ShellOrganization, ShellUser } from "./types";

export function AccountMenu({ user, organization, role }: { user: ShellUser; organization: ShellOrganization; role: Role }) {
  const [signingOut, startSignOut] = React.useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 items-center gap-2 rounded-md pl-1 pr-2 hover:bg-sunken data-[state=open]:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="Account menu"
      >
        <Avatar name={user.name} size="md" />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-ink md:inline">{user.name}</span>
        <ChevronDown className="hidden size-3.5 text-ink-3 md:inline" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <div className="flex items-start gap-3 px-2 py-2">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-3">{user.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <RoleBadge role={role} />
            </div>
          </div>
        </div>
        <div className="mx-2 mb-1 rounded-sm border border-line bg-surface-2 px-2 py-1.5">
          <p className="eyebrow">Organization</p>
          <p className="truncate text-xs font-medium text-ink">{organization.name}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <UserRound className="size-4 text-ink-3" aria-hidden /> Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/security">
            <ShieldCheck className="size-4 text-ink-3" aria-hidden /> Security &amp; sessions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/organization">
            <Settings className="size-4 text-ink-3" aria-hidden /> Organization settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ThemeMenuGroup />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          destructive
          disabled={signingOut}
          onSelect={(e) => {
            e.preventDefault();
            startSignOut(async () => {
              await signOutAction();
            });
          }}
        >
          {signingOut ? <Spinner className="size-4" /> : <LogOut className="size-4" aria-hidden />}
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
