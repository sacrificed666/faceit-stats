"use client";

import { useSyncExternalStore } from "react";

import { THEME_STORAGE_KEY, themeColorFor, type ThemePreference } from "@/shared/lib/theme";

const listeners = new Set<() => void>();

// Registers a component to hear about changes
const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// The theme applied to the page, or the system theme
const getSnapshot = (): ThemePreference => {
  const theme = document.documentElement.dataset.theme;
  return theme === "light" || theme === "dark" ? theme : "system";
};

// The server cannot know the choice, so it renders the system theme
const getServerSnapshot = (): ThemePreference => "system";

// Saves the theme, or forgets it for the system theme
const persist = (preference: ThemePreference): void => {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    return;
  }
};

// Applies the theme and the browser colour, then tells every subscriber
export const setTheme = (preference: ThemePreference): void => {
  const root = document.documentElement;
  if (preference === "system") delete root.dataset.theme;
  else root.dataset.theme = preference;
  persist(preference);
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = themeColorFor(preference, meta.media);
  }
  for (const listener of listeners) listener();
};

// The theme choice of the visitor
export const useTheme = (): ThemePreference => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
