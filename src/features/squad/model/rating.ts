import type { Match } from "./types";

type RoundStats = Pick<
  Match,
  "rounds" | "kills" | "deaths" | "doubleKills" | "tripleKills" | "quadroKills" | "pentaKills"
>;

// Averages of professional play that the HLTV 1.0 rating is measured against
const AVERAGE_KILLS_PER_ROUND = 0.679;
const AVERAGE_SURVIVAL_PER_ROUND = 0.317;
const AVERAGE_MULTI_KILL_SCORE = 1.277;

// Share of rounds survived, in percent
export const survivalRate = ({ rounds, deaths }: Pick<Match, "rounds" | "deaths">): number =>
  rounds > 0 ? Math.min(Math.max((rounds - deaths) / rounds, 0), 1) * 100 : 0;

// HLTV 1.0 rating of one match: kills, survival and multi-kill rounds per round
export const matchRating = (stats: RoundStats): number => {
  const { rounds, kills, doubleKills, tripleKills, quadroKills, pentaKills } = stats;
  if (rounds <= 0) return 0;
  const singleKills = Math.max(kills - 2 * doubleKills - 3 * tripleKills - 4 * quadroKills - 5 * pentaKills, 0);
  const multiKillScore = singleKills + 4 * doubleKills + 9 * tripleKills + 16 * quadroKills + 25 * pentaKills;
  const killRating = kills / rounds / AVERAGE_KILLS_PER_ROUND;
  const survivalRating = survivalRate(stats) / 100 / AVERAGE_SURVIVAL_PER_ROUND;
  const multiKillRating = multiKillScore / rounds / AVERAGE_MULTI_KILL_SCORE;
  return (killRating + 0.7 * survivalRating + multiKillRating) / 2.7;
};
