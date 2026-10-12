import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makePlayer } from "@/test/factories";
import { renderWithI18n } from "@/test/render";

import ProfileHero from "./ProfileHero";

describe("ProfileHero", () => {
  it("introduces the player with level, ranking and profile links", () => {
    const player = makePlayer({
      nickname: "sacrificed",
      elo: 2404,
      level: 10,
      region: "EU",
      regionRank: 65_552,
      steamId: "76561199147388137",
    });
    renderWithI18n(<ProfileHero player={player} />);

    expect(screen.getByRole("heading", { level: 1, name: "sacrificed" })).toBeInTheDocument();
    expect(screen.getByText("#65,552 in EU")).toBeInTheDocument();
    expect(screen.getByText("Level 10")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Level 10" })).toHaveAttribute("aria-valuetext", "403 ELO above level 10");
    expect(screen.getByRole("link", { name: /^FACEIT/ })).toHaveAttribute(
      "href",
      "https://www.faceit.com/en/players/sacrificed",
    );
    expect(screen.getByRole("link", { name: /Steam/ })).toHaveAttribute(
      "href",
      "https://steamcommunity.com/profiles/76561199147388137",
    );
  });

  it("shows the ELO still needed for the next level", () => {
    renderWithI18n(<ProfileHero player={makePlayer({ elo: 1688, level: 8, steamId: null })} />);
    expect(screen.getByRole("meter", { name: "Progress to level 9" })).toHaveAttribute(
      "aria-valuetext",
      "63 ELO to level 9",
    );
    expect(screen.queryByRole("link", { name: /Steam/ })).not.toBeInTheDocument();
  });
});
