import type { Player } from "./types";

// A nickname from the address, even when it is badly encoded
export const decodeNickname = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// A player by nickname in any letter case
export const findPlayer = (players: readonly Player[], nickname: string): Player | null => {
  const wanted = decodeNickname(nickname).toLowerCase();
  return players.find((player) => player.nickname.toLowerCase() === wanted) ?? null;
};
