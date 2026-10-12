export interface Match {
  id: string;
  finishedAt: number;
  map: string;
  won: boolean;
  teamScore: number;
  opponentScore: number;
  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  kr: number;
  adr: number;
  hsPercent: number;
  mvps: number;
  doubleKills: number;
  tripleKills: number;
  quadroKills: number;
  pentaKills: number;
  rating: number;
  survival: number;
}

export interface LifetimeStats {
  matches: number;
  winRate: number;
  longestWinStreak: number;
  kd: number;
  hsPercent: number;
  adr: number | null;
  entryRate: number | null;
  entrySuccessRate: number | null;
  oneVsOneWinRate: number | null;
  oneVsTwoWinRate: number | null;
  flashSuccessRate: number | null;
  utilityDamagePerRound: number | null;
  sniperKillRate: number | null;
}

export interface MapSegment {
  map: string;
  matches: number;
  winRate: number;
  kd: number;
  adr: number | null;
  hsPercent: number;
  image: string | null;
}

export interface Player {
  id: string;
  nickname: string;
  avatar: string | null;
  country: string | null;
  elo: number;
  level: number;
  region: string | null;
  regionRank: number | null;
  steamId: string | null;
  lifetime: LifetimeStats | null;
  maps: MapSegment[];
  matches: Match[];
}

export interface FailedPlayer {
  nickname: string;
  reason: "not-found" | "error";
}

export type ConfigVariable = "FACEIT_API_KEY" | "FACEIT_PLAYERS";

export type ApiFailure = "unauthorized" | "rate-limited" | "unreachable";

export type SquadSnapshot =
  | { status: "ready"; players: Player[]; failed: FailedPlayer[]; updatedAt: number }
  | { status: "unconfigured"; missing: ConfigVariable[] }
  | { status: "unavailable"; reason: ApiFailure; updatedAt: number };
