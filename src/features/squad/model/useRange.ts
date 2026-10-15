"use client";

import { setSearchParams, useSearchParam } from "@/shared/hooks/useQuery";

import { DEFAULT_RANGE, parseRange, type Range } from "./range";

// The range in the address, or the default one
export const useRange = (): Range => parseRange(useSearchParam("range")) ?? DEFAULT_RANGE;

// Puts a range into the address
export const setRange = (range: Range): void => {
  setSearchParams({ range: range === DEFAULT_RANGE ? null : range });
};

// A path that keeps the range, unless it is the default one
export const withRange = <P extends string>(path: P, range: Range): P | `${P}?range=${Range}` =>
  range === DEFAULT_RANGE ? path : `${path}?range=${range}`;
