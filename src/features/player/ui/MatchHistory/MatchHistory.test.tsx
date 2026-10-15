import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { viewPlayer } from "@/features/squad/model/squad";
import { makeMatch, makePlayer } from "@/test/factories";
import { renderWithI18n } from "@/test/render";

import MatchHistory from "./MatchHistory";

const NOW = Date.UTC(2026, 9, 3, 10);

const player = makePlayer({
  nickname: "anna",
  matches: [
    makeMatch({ id: "ace", map: "de_nuke", won: true, kills: 31, rating: 1.6, pentaKills: 2, quadroKills: 1, mvps: 0 }),
    makeMatch({ id: "loss", map: "de_mirage", won: false, kills: 12, rating: 0.7, pentaKills: 1, tripleKills: 2 }),
    makeMatch({ id: "plain", map: "de_mirage", won: true, kills: 18, rating: 1.05, mvps: 0 }),
  ],
});

// The first cell of every row in the history table
const firstCells = () =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[1]?.textContent);

describe("MatchHistory", () => {
  it("shows aces, 4K and 3K rounds as badges", () => {
    renderWithI18n(<MatchHistory view={viewPlayer(player, "20", NOW)} squad={new Map()} mates={new Map()} />);
    expect(screen.getByText("2× Ace")).toBeInTheDocument();
    expect(screen.getByText("1× 4K")).toBeInTheDocument();
    expect(screen.getByText("Ace")).toBeInTheDocument();
    expect(screen.getByText("2× 3K")).toBeInTheDocument();
  });

  it("sorts by a column in both directions", async () => {
    const user = userEvent.setup();
    renderWithI18n(<MatchHistory view={viewPlayer(player, "20", NOW)} squad={new Map()} mates={new Map()} />);
    await user.click(screen.getByRole("button", { name: /^K ?, Kills$/u }));
    expect(firstCells()).toEqual(["31-15-4", "18-15-4", "12-15-4"]);
    await user.click(screen.getByRole("button", { name: /^K ?, Kills$/u }));
    expect(firstCells()).toEqual(["12-15-4", "18-15-4", "31-15-4"]);
  });

  it("filters losses and says when nothing matches", async () => {
    const user = userEvent.setup();
    renderWithI18n(<MatchHistory view={viewPlayer(player, "20", NOW)} squad={new Map()} mates={new Map()} />);
    await user.click(screen.getByRole("radio", { name: "Losses" }));
    expect(firstCells()).toEqual(["12-15-4"]);
    await user.selectOptions(screen.getByRole("combobox", { name: "Map" }), "de_nuke");
    expect(screen.getByText("No matches match these filters")).toBeInTheDocument();
  });
});
