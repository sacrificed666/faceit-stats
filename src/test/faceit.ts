export const PROFILE = {
  player_id: "d23c8ac1-faa3-49f5-a27d-7eb2be663398",
  nickname: "sacrificed",
  avatar: "https://distribution.faceit-cdn.net/images/avatar.jpeg",
  country: "UA",
  steam_id_64: "76561199147388137",
  games: { cs2: { region: "EU", skill_level: 10, faceit_elo: 2404 } },
};

// One FACEIT match statistics item, with fields to override
export const matchItem = (overrides: Record<string, string | number> = {}) => ({
  stats: {
    "Match Id": "1-194343b4-6a43-443b-87dd-5ae99b90ed13",
    "Match Finished At": 1_789_811_099_000,
    "Game Mode": "5v5",
    Map: "de_ancient",
    Result: "0",
    Score: "13 / 10",
    "Final Score": "10",
    Rounds: "23",
    Kills: "9",
    Deaths: "21",
    Assists: "4",
    "K/D Ratio": "0.43",
    "K/R Ratio": "0.39",
    ADR: "56.3",
    "Headshots %": "78",
    MVPs: "0",
    "Triple Kills": "0",
    "Quadro Kills": "0",
    "Penta Kills": "0",
    ...overrides,
  },
});

export const LIFETIME = {
  lifetime: {
    Matches: "1838",
    "Win Rate %": "51",
    "Longest Win Streak": "14",
    "Average K/D Ratio": "1.21",
    "Average Headshots %": "48",
    ADR: "82.43",
    "Entry Rate": "0.2",
    "Entry Success Rate": "0.53",
    "1v1 Win Rate": "0.38",
    "1v2 Win Rate": "0.2",
    "Flash Success Rate": "0.52",
    "Utility Damage per Round": "4.89",
    "Sniper Kill Rate": "0.13",
  },
  segments: [
    {
      type: "Map",
      mode: "5v5",
      label: "Dust2",
      img_regular: "https://distribution.faceit-cdn.net/images/dust2.jpeg",
      stats: {
        Matches: "40",
        "Win Rate %": "55",
        "Average K/D Ratio": "1.3",
        ADR: "88.1",
        "Average Headshots %": "50",
      },
    },
    {
      type: "Map",
      mode: "5v5",
      label: "Mirage",
      img_regular: "https://example.com/mirage.jpeg",
      stats: { Matches: "120", "Win Rate %": "51", "Average K/D Ratio": "1.1", "Average Headshots %": "47" },
    },
    {
      type: "Map",
      mode: "Wingman",
      label: "Overpass",
      stats: { Matches: "4", "Win Rate %": "100" },
    },
    {
      type: "Map",
      mode: "5v5",
      label: "Cache",
      stats: { Matches: "0" },
    },
  ],
};
