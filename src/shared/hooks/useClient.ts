"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

// The time zone never changes during a visit
const subscribeNever = (): (() => void) => () => {};

// The visitor's time zone
const browserTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;

// The server renders dates in UTC
const serverTimeZone = (): string => "UTC";

// The visitor's time zone in the browser, UTC on the server
export const useTimeZone = (): string => useSyncExternalStore(subscribeNever, browserTimeZone, serverTimeZone);

let now = 0;

// Ticks once a minute so relative times stay current
const subscribeMinutes = (listener: () => void): (() => void) => {
  now = Date.now();
  const timer = window.setInterval(() => {
    now = Date.now();
    listener();
  }, MINUTE);
  return () => window.clearInterval(timer);
};

// The current time, updated by the minute
const clientNow = (): number => {
  if (now === 0) now = Date.now();
  return now;
};

// The server has no clock for relative times
const serverNow = (): null => null;

// The current minute in the browser, null on the server
export const useNow = (): number | null => useSyncExternalStore(subscribeMinutes, clientNow, serverNow);
