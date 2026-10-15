import type { Locale } from "@/shared/i18n/locales";

// The squad overview in a language
export const homePath = (locale: Locale): `/${Locale}` => `/${locale}`;

// A player page in a language
export const playerPath = (locale: Locale, nickname: string): `/${Locale}/players/${string}` =>
  `/${locale}/players/${encodeURIComponent(nickname)}`;

// The compare page in a language
export const comparePath = (locale: Locale): `/${Locale}/compare` => `/${locale}/compare`;

// The player's profile on FACEIT
export const faceitProfileUrl = (nickname: string): string => {
  return `https://www.faceit.com/en/players/${encodeURIComponent(nickname)}`;
};

// The match room on FACEIT
export const faceitMatchUrl = (matchId: string): string => {
  return `https://www.faceit.com/en/cs2/room/${encodeURIComponent(matchId)}`;
};

// The player's Steam profile
export const steamProfileUrl = (steamId: string): string => {
  return `https://steamcommunity.com/profiles/${encodeURIComponent(steamId)}`;
};

// A country flag served by the app
export const flagUrl = (countryCode: string): string => `/flags/${encodeURIComponent(countryCode.toUpperCase())}`;
