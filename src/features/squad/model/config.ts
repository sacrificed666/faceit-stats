import type { ConfigVariable } from "./types";

export const MAX_PLAYERS = 20;

export interface SquadConfig {
  apiKey: string | null;
  nicknames: string[];
}

// Nicknames from the variable, without duplicates and up to the squad limit
export const parseNicknames = (value: string | undefined): string[] => {
  const seen = new Set<string>();
  const nicknames: string[] = [];
  for (const nickname of (value ?? "").split(/[\s,;]+/)) {
    const key = nickname.toLowerCase();
    if (nickname === "" || seen.has(key)) continue;
    seen.add(key);
    nicknames.push(nickname);
  }
  return nicknames.slice(0, MAX_PLAYERS);
};

// The API key and the nicknames from the environment
export const readSquadConfig = (env: Partial<Record<string, string>> = process.env): SquadConfig => {
  const apiKey = env.FACEIT_API_KEY?.trim() ?? "";
  return { apiKey: apiKey === "" ? null : apiKey, nicknames: parseNicknames(env.FACEIT_PLAYERS) };
};

// Environment variables that still need a value
export const missingVariables = (config: SquadConfig): ConfigVariable[] => {
  const missing: ConfigVariable[] = [];
  if (!config.apiKey) missing.push("FACEIT_API_KEY");
  if (config.nicknames.length === 0) missing.push("FACEIT_PLAYERS");
  return missing;
};
