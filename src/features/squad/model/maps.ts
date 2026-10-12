import type { Player } from "./types";

const MAP_NAMES: Record<string, string> = {
  de_ancient: "Ancient",
  de_anubis: "Anubis",
  de_cache: "Cache",
  de_dust2: "Dust II",
  de_inferno: "Inferno",
  de_mirage: "Mirage",
  de_nuke: "Nuke",
  de_overpass: "Overpass",
  de_train: "Train",
  de_vertigo: "Vertigo",
};

const PREFIX = /^(?:de|cs|ar|gd)_/;

// A map name or key without prefix and punctuation, for comparing
export const mapId = (nameOrKey: string): string =>
  nameOrKey
    .toLowerCase()
    .replace(PREFIX, "")
    .replaceAll(/[^a-z0-9]/g, "");

// The match map key for a map name from the lifetime statistics
export const mapKey = (nameOrKey: string): string => {
  const id = mapId(nameOrKey);
  return Object.keys(MAP_NAMES).find((key) => mapId(key) === id) ?? `de_${id}`;
};

// The display name of a map key
export const mapName = (key: string): string => {
  const known = MAP_NAMES[key];
  if (known) return known;
  const words = key.replace(PREFIX, "").split(/[_-]+/).filter(Boolean);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") || key;
};

// The picture FACEIT shows for each map, from the lifetime stats of the squad
export const mapImages = (players: readonly Pick<Player, "maps">[]): Record<string, string> => {
  const images: Record<string, string> = {};
  for (const { maps } of players) {
    for (const segment of maps) if (segment.image && !(segment.map in images)) images[segment.map] = segment.image;
  }
  return images;
};
