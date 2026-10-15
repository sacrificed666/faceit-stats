import { createServer, type ServerResponse } from "node:http";

const PORT = Number(process.env.E2E_API_PORT ?? 4010);
const API_KEY = process.env.E2E_API_KEY ?? "e2e-key";
const HOUR = 3_600_000;
const NOW = Math.floor(Date.now() / HOUR) * HOUR;
const MAPS = ["de_mirage", "de_inferno", "de_nuke", "de_ancient", "de_anubis", "de_dust2", "de_train"];
const SLOTS = 140;

interface MockPlayer {
  id: string;
  nickname: string;
  country: string;
  elo: number;
  level: number;
  region: string;
  rank: number;
  steamId: string | null;
  skill: number;
  lifetime: boolean;
}

interface Appearance {
  slot: number;
  matchId: string;
  map: string;
  won: boolean;
  teamScore: number;
  opponentScore: number;
}

const PLAYERS: MockPlayer[] = [
  {
    id: "e2e-anna",
    nickname: "anna",
    country: "UA",
    elo: 2450,
    level: 10,
    region: "EU",
    rank: 812,
    steamId: "76561198000000001",
    skill: 1.3,
    lifetime: true,
  },
  {
    id: "e2e-bohdan",
    nickname: "Bohdan",
    country: "PL",
    elo: 1960,
    level: 9,
    region: "EU",
    rank: 15_204,
    steamId: "76561198000000002",
    skill: 1.1,
    lifetime: true,
  },
  {
    id: "e2e-chris",
    nickname: "chris",
    country: "DE",
    elo: 1480,
    level: 7,
    region: "EU",
    rank: 64_310,
    steamId: null,
    skill: 0.95,
    lifetime: true,
  },
  {
    id: "e2e-dana",
    nickname: "dana",
    country: "NL",
    elo: 1150,
    level: 5,
    region: "EU",
    rank: 141_877,
    steamId: "76561198000000004",
    skill: 0.85,
    lifetime: false,
  },
];

// A seeded random generator, so every run gets the same squad
const random = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
};

// One random item of a list
const pick = <T>(items: readonly T[], next: () => number): T => {
  const item = items[Math.floor(next() * items.length)];
  if (item === undefined) throw new Error("Cannot pick from an empty list");
  return item;
};

// A shuffled copy of a list
const shuffle = <T>(items: readonly T[], next: () => number): T[] => {
  const pool = [...items];
  const result: T[] = [];
  while (pool.length > 0) {
    const [item] = pool.splice(Math.floor(next() * pool.length), 1);
    if (item !== undefined) result.push(item);
  }
  return result;
};

// Who played which match: solo, in a party or against a squad mate
const schedule = (): Map<string, Appearance[]> => {
  const next = random(2026);
  const appearances = new Map<string, Appearance[]>(PLAYERS.map((player) => [player.id, []]));
  for (let slot = 0; slot < SLOTS; slot += 1) {
    const matchId = `1-e2e-${String(slot).padStart(4, "0")}`;
    const map = pick(MAPS, next);
    const losing = 3 + Math.floor(next() * 9);
    const roll = next();
    const shuffled = shuffle(PLAYERS, next);
    const size = roll < 0.55 ? 1 : roll < 0.8 ? 2 : roll < 0.92 ? 3 : 4;
    const team = shuffled.slice(0, size);
    const won = next() < 0.55;
    for (const player of team) {
      appearances
        .get(player.id)
        ?.push({ slot, matchId, map, won, teamScore: won ? 13 : losing, opponentScore: won ? losing : 13 });
    }
    const rival = shuffled[size];
    if (rival && next() < 0.08) {
      appearances
        .get(rival.id)
        ?.push({ slot, matchId, map, won: !won, teamScore: won ? losing : 13, opponentScore: won ? 13 : losing });
    }
  }
  return appearances;
};

const APPEARANCES = schedule();

// FACEIT match statistics for one appearance, shaped by the player's skill
const matchStats = (player: MockPlayer, appearance: Appearance, index: number) => {
  const next = random(appearance.slot * 31 + player.id.length * 7 + index);
  const rounds = appearance.teamScore + appearance.opponentScore;
  const form = player.skill * (appearance.won ? 1.1 : 0.85) * (0.75 + next() * 0.5);
  const kills = Math.max(3, Math.round(rounds * 0.72 * form));
  const deaths = Math.max(4, Math.round(rounds * (0.62 + next() * 0.2) * (appearance.won ? 0.85 : 1.1)));
  const ace = player.nickname === "anna" && index === 3 ? 1 : 0;
  return {
    "Match Id": appearance.matchId,
    "Match Finished At": NOW - (appearance.slot * 11 + 2) * HOUR,
    "Game Mode": "5v5",
    Map: appearance.map,
    Result: appearance.won ? "1" : "0",
    Score: `${Math.max(appearance.teamScore, appearance.opponentScore)} / ${Math.min(appearance.teamScore, appearance.opponentScore)}`,
    "Final Score": String(appearance.teamScore),
    Rounds: String(rounds),
    Kills: String(kills),
    Deaths: String(deaths),
    Assists: String(Math.round(next() * 8)),
    "K/D Ratio": (kills / deaths).toFixed(2),
    "K/R Ratio": (kills / rounds).toFixed(2),
    ADR: (55 + 40 * form + next() * 10).toFixed(1),
    "Headshots %": String(Math.round(35 + next() * 30)),
    MVPs: String(Math.round(next() * (appearance.won ? 6 : 3))),
    "Double Kills": String(Math.round(kills / 6)),
    "Triple Kills": String(next() < 0.35 ? 1 : 0),
    "Quadro Kills": String(next() < 0.08 ? 1 : 0),
    "Penta Kills": String(ace),
  };
};

// Lifetime statistics with map segments for a mock player
const lifetime = (player: MockPlayer) => {
  const segments = MAPS.slice(0, 5).map((map, index) => ({
    type: "Map",
    mode: "5v5",
    label: `${map.charAt(3).toUpperCase()}${map.slice(4)}`,
    stats: {
      Matches: String(240 - index * 35),
      "Win Rate %": String(48 + ((index * 3 + player.elo) % 9)),
      "Average K/D Ratio": (player.skill - 0.05 + index * 0.03).toFixed(2),
      ADR: (70 + player.skill * 12).toFixed(1),
      "Average Headshots %": String(44 + index),
    },
  }));
  return {
    lifetime: {
      Matches: String(1200 + player.elo),
      "Win Rate %": String(Math.round(46 + player.skill * 5)),
      "Longest Win Streak": String(Math.round(6 + player.skill * 6)),
      "Average K/D Ratio": player.skill.toFixed(2),
      "Average Headshots %": "47",
      ADR: (68 + player.skill * 13).toFixed(2),
      "Entry Rate": "0.21",
      "Entry Success Rate": (0.4 + player.skill / 10).toFixed(2),
      "1v1 Win Rate": "0.41",
      "1v2 Win Rate": "0.18",
      "Flash Success Rate": "0.49",
      "Utility Damage per Round": "5.12",
      "Sniper Kill Rate": "0.09",
    },
    segments,
  };
};

// Sends a JSON response that is never cached
const send = (response: ServerResponse, status: number, body: unknown): void => {
  response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);
  if (url.pathname === "/health") return send(response, 200, { ok: true });
  if (request.headers.authorization !== `Bearer ${API_KEY}`) return send(response, 401, { errors: ["unauthorized"] });

  const parts = url.pathname
    .replace(/^\/data\/v4\//, "")
    .split("/")
    .map(decodeURIComponent);
  if (parts[0] === "players" && parts.length === 1) {
    const player = PLAYERS.find((entry) => entry.nickname === url.searchParams.get("nickname"));
    if (!player) return send(response, 404, { errors: ["not found"] });
    return send(response, 200, {
      player_id: player.id,
      nickname: player.nickname,
      avatar: "",
      country: player.country,
      steam_id_64: player.steamId ?? "",
      games: { cs2: { region: player.region, skill_level: player.level, faceit_elo: player.elo } },
    });
  }

  const player = PLAYERS.find((entry) => entry.id === parts[1] || entry.id === parts[6]);
  if (!player) return send(response, 404, { errors: ["not found"] });

  if (parts[0] === "players" && parts[2] === "games" && parts[4] === "stats") {
    const items = (APPEARANCES.get(player.id) ?? []).map((appearance, index) => ({
      stats: matchStats(player, appearance, index),
    }));
    return send(response, 200, { items: items.slice(0, Number(url.searchParams.get("limit") ?? 100)) });
  }
  if (parts[0] === "players" && parts[2] === "stats") {
    return player.lifetime ? send(response, 200, lifetime(player)) : send(response, 404, { errors: ["not found"] });
  }
  if (parts[0] === "rankings") return send(response, 200, { position: player.rank });
  return send(response, 404, { errors: ["not found"] });
});

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`FACEIT mock API on http://127.0.0.1:${PORT}/data/v4/\n`);
});
