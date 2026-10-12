"use client";

import { useState } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState<K extends string> {
  key: K;
  direction: SortDirection;
}

// Sort key and direction; a second click on a column reverses it
export const useSort = <K extends string>(initial: K, initialDirection: SortDirection = "desc") => {
  const [sort, setSort] = useState<SortState<K>>({ key: initial, direction: initialDirection });

  // A new column starts high to low; the same column flips the order
  const toggle = (key: K): void => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "desc" ? "asc" : "desc" }
        : { key, direction: "desc" },
    );
  };

  return { sort, toggle };
};

// A comparator for a number in either direction
export const compareBy =
  <T>(value: (item: T) => number, direction: SortDirection): ((a: T, b: T) => number) =>
  (a, b) =>
    direction === "desc" ? value(b) - value(a) : value(a) - value(b);
