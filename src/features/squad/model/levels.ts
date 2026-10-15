export interface Level {
  level: number;
  min: number;
  max: number | null;
  color: string;
}

export interface LevelProgress {
  current: Level;
  next: Level | null;
  progress: number;
  eloToNext: number | null;
}

const FIRST_LEVEL: Level = { level: 1, min: 100, max: 500, color: "#eeeeee" };
const TOP_LEVEL: Level = { level: 10, min: 2001, max: null, color: "#fe1f00" };

export const LEVELS: readonly Level[] = [
  FIRST_LEVEL,
  { level: 2, min: 501, max: 750, color: "#1ce400" },
  { level: 3, min: 751, max: 900, color: "#1ce400" },
  { level: 4, min: 901, max: 1050, color: "#ffc800" },
  { level: 5, min: 1051, max: 1200, color: "#ffc800" },
  { level: 6, min: 1201, max: 1350, color: "#ffc800" },
  { level: 7, min: 1351, max: 1530, color: "#ffc800" },
  { level: 8, min: 1531, max: 1750, color: "#ff6309" },
  { level: 9, min: 1751, max: 2000, color: "#ff6309" },
  TOP_LEVEL,
];

// A FACEIT level by its number
export const levelOf = (level: number): Level =>
  LEVELS.find((entry) => entry.level === level) ?? (level > TOP_LEVEL.level ? TOP_LEVEL : FIRST_LEVEL);

// The FACEIT level an ELO falls into
export const levelForElo = (elo: number): Level =>
  LEVELS.find((entry) => entry.max === null || elo <= entry.max) ?? TOP_LEVEL;

// Progress to the next level, or the ELO above level 10
export const levelProgress = (elo: number): LevelProgress => {
  const current = levelForElo(elo);
  const next = LEVELS.find((entry) => entry.level === current.level + 1) ?? null;
  if (!next || current.max === null) return { current, next: null, progress: 1, eloToNext: null };
  const span = next.min - current.min;
  const progress = Math.min(Math.max((elo - current.min) / span, 0), 1);
  return { current, next, progress, eloToNext: Math.max(next.min - elo, 0) };
};
