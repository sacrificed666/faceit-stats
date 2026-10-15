import { SITE } from "./site";

export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "faceit-stats/theme";

// The browser colour for a theme and a theme-color media query
export const themeColorFor = (preference: ThemePreference, media: string): string => {
  if (preference === "system") return media.includes("dark") ? SITE.themeColor.dark : SITE.themeColor.light;
  return SITE.themeColor[preference];
};
