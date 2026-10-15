import { connection } from "next/server";

import { getSquad } from "@/features/squad/api/loader";

const HEADERS = { "Cache-Control": "no-store" };

// How fresh the squad is, for the monitor workflow
export const GET = async () => {
  await connection();
  try {
    const squad = await getSquad();
    if (squad.status !== "ready") return Response.json({ status: squad.status }, { status: 503, headers: HEADERS });
    return Response.json(
      {
        status: squad.status,
        players: squad.players.length,
        failed: squad.failed.length,
        updatedAt: new Date(squad.updatedAt).toISOString(),
        ageSeconds: Math.max(0, Math.round((Date.now() - squad.updatedAt) / 1000)),
      },
      { headers: HEADERS },
    );
  } catch {
    return Response.json({ status: "error" }, { status: 503, headers: HEADERS });
  }
};
