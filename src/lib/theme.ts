export const THEME_COOKIE = "sw_theme";
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

/** Theme used when the visitor has not chosen one. */
export const DEFAULT_THEME: Theme = "light";

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}
