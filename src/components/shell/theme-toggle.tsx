"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { THEME_COOKIE, type Theme } from "@/lib/theme";
import { DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-theme-preference", theme);
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function useThemePreference(): [Theme, (t: Theme) => void] {
  // Only rendered inside an open menu (client-only), so reading the DOM in
  // the initializer is safe.
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof document === "undefined") return "system";
    const pref = document.documentElement.getAttribute("data-theme-preference");
    return pref === "light" || pref === "dark" || pref === "system" ? pref : "system";
  });
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (document.documentElement.getAttribute("data-theme-preference") === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const update = React.useCallback((t: Theme) => {
    setTheme(t);
    applyTheme(t);
  }, []);
  return [theme, update];
}

/** Theme selector rendered inside the account dropdown. */
export function ThemeMenuGroup() {
  const [theme, setTheme] = useThemePreference();
  return (
    <>
      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
        <DropdownMenuRadioItem value="light">
          <Sun className="size-4 text-ink-3" aria-hidden /> Light
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark">
          <Moon className="size-4 text-ink-3" aria-hidden /> Dark
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="system">
          <Monitor className="size-4 text-ink-3" aria-hidden /> System
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </>
  );
}
