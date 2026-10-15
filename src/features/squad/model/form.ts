import type { Match } from "./types";

export interface Streak {
  won: boolean;
  length: number;
}

// The run of equal results the newest match belongs to
export const currentStreak = (matches: readonly Match[]): Streak | null => {
  const latest = matches[0];
  if (!latest) return null;
  const breakIndex = matches.findIndex((match) => match.won !== latest.won);
  return { won: latest.won, length: breakIndex === -1 ? matches.length : breakIndex };
};

// The longest run of wins or losses
export const longestStreak = (matches: readonly Match[], won: boolean): number => {
  let longest = 0;
  let running = 0;
  for (const match of matches) {
    running = match.won === won ? running + 1 : 0;
    longest = Math.max(longest, running);
  }
  return longest;
};
