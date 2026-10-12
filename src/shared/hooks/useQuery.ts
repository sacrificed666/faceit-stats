"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

// Hears about our own address updates and the back and forward buttons
const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
};

// The query string of the address
const clientSearch = (): string => window.location.search;

// Static pages are rendered without a query
const serverSearch = (): string => "";

// The query string, which updates without a navigation
export const useSearch = (): string => useSyncExternalStore(subscribe, clientSearch, serverSearch);

// One search parameter of the address
export const useSearchParam = (name: string): string | null => new URLSearchParams(useSearch()).get(name);

// Updates the address in place and tells every subscriber
export const setSearchParams = (updates: Readonly<Record<string, string | null>>): void => {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  for (const listener of listeners) listener();
};
