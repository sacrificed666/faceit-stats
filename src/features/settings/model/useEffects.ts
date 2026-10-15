"use client";

import { useSyncExternalStore } from "react";

import {
  EFFECTS_STORAGE_KEY,
  isEffects,
  prefersRichEffects,
  resolveEffects,
  type Effects,
  type EffectsLevel,
} from "@/shared/lib/effects";

const listeners = new Set<() => void>();

// Registers a component to hear about changes
const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// The saved effects choice, or auto
const getSnapshot = (): Effects => {
  try {
    const stored = localStorage.getItem(EFFECTS_STORAGE_KEY);
    return isEffects(stored) ? stored : "auto";
  } catch {
    return "auto";
  }
};

// The server cannot know the choice, so it renders auto
const getServerSnapshot = (): Effects => "auto";

// Saves the choice, or forgets it for auto
const persist = (preference: Effects): void => {
  try {
    if (preference === "auto") localStorage.removeItem(EFFECTS_STORAGE_KEY);
    else localStorage.setItem(EFFECTS_STORAGE_KEY, preference);
  } catch {
    return;
  }
};

// The level auto picks on this device
const deviceEffects = (): EffectsLevel => resolveEffects("auto", prefersRichEffects(navigator.userAgent));

// Applies the effects to the page, saves them and tells every subscriber
export const setEffects = (preference: Effects): void => {
  document.documentElement.dataset.effects = preference === "auto" ? deviceEffects() : preference;
  persist(preference);
  for (const listener of listeners) listener();
};

// The effects choice of the visitor
export const useEffects = (): Effects => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

// The level auto picks here, or null while rendering on the server
export const useDeviceEffects = (): EffectsLevel | null => useSyncExternalStore(subscribe, deviceEffects, () => null);
