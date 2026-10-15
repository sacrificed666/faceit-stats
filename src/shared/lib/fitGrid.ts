import type { CSSProperties } from "react";

export type FitBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

export type FitPlan = Partial<Record<FitBreakpoint, readonly number[]>>;

// Empty cells of the last row; a row that splits the width evenly has none
const emptyCells = (count: number, columns: number): number => {
  const rest = count % columns;
  if (rest === 0 || (rest > 1 && columns % rest === 0)) return 0;
  return columns - rest;
};

// The column count with the fewest empty cells, the widest on a tie
export const fitColumns = (count: number, options: readonly number[]): number =>
  options.reduce((best, columns) => {
    const difference = emptyCells(count, columns) - emptyCells(count, best);
    return difference < 0 || (difference === 0 && columns > best) ? columns : best;
  });

// Columns per breakpoint, and wider cards in a short last row
export const fitGrid = (count: number, plan: FitPlan) => {
  const columns = Object.entries(plan).map(
    ([breakpoint, options]) => [breakpoint, fitColumns(count, options)] as const,
  );
  const list = Object.fromEntries(
    columns.map(([breakpoint, value]) => [`--cols-${breakpoint}`, value]),
  ) as CSSProperties;

  // The span of one card: cards of a short last row share the row evenly
  const item = (index: number): CSSProperties | undefined => {
    const spans = columns.flatMap(([breakpoint, value]) => {
      const rest = count % value;
      const stretch = rest > 1 && value % rest === 0 && index >= count - rest;
      return stretch ? [[`--span-${breakpoint}`, value / rest] as const] : [];
    });
    return spans.length > 0 ? Object.fromEntries(spans) : undefined;
  };

  return { list, item };
};
