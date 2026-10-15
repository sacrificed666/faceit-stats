import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { Locale } from "@/shared/i18n/locales";
import { makePlayer } from "@/test/factories";
import { renderWithI18n } from "@/test/render";
import { sampleSquad } from "@/test/squad";

import Dashboard from "./Dashboard";

const UPDATED_AT = Date.UTC(2026, 9, 3, 10);

// Renders the dashboard for the sample squad
const renderDashboard = (
  failed = [] as Array<{ nickname: string; reason: "not-found" | "error" }>,
  locale: Locale = "en",
) => {
  const players = sampleSquad();
  renderWithI18n(<Dashboard players={players} failed={failed} updatedAt={UPDATED_AT} mapImages={{}} />, locale);
  return players;
};

// The player names of the leaderboard rows
const leaderboardRows = (): string[] => {
  const table = screen.getByRole("table", { name: /Squad leaderboard/ });
  return within(table)
    .getAllByRole("row")
    .slice(1, -1)
    .map((row) => within(row).getByRole("link").textContent);
};

describe("Dashboard", () => {
  it("shows every section of the squad overview", () => {
    renderDashboard();
    expect(screen.getByRole("heading", { level: 1, name: "Squad stats" })).toBeInTheDocument();
    for (const name of [
      "Players",
      "Recent matches",
      "Leaderboard",
      "Rankings",
      "Trends",
      "Map pool",
      "Playing together",
      "Records",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    for (const link of screen.getAllByRole("link", { name: "anna" })) {
      expect(link).toHaveAttribute("href", "/en/players/anna");
    }
    expect(screen.getByRole("link", { name: "Compare two players" })).toHaveAttribute("href", "/en/compare");
  });

  it("shows the hottest streak as a number with its word", () => {
    renderDashboard();
    const tile = screen.getByText("Hottest streak").closest("div");
    if (!tile) throw new Error("The streak tile is missing");
    expect(within(tile).getAllByRole("definition")[0]).toHaveTextContent(/^\d+(win|wins)$/u);
  });

  it("sorts the leaderboard by the selected column", async () => {
    const user = userEvent.setup();
    renderDashboard();
    expect(leaderboardRows()).toEqual(["anna", "bohdan", "chris"]);

    const table = screen.getByRole("table", { name: /Squad leaderboard/ });
    await user.click(within(table).getByRole("button", { name: /^K\/D/ }));
    expect(leaderboardRows()).toEqual(["chris", "anna", "bohdan"]);
    expect(within(table).getByRole("columnheader", { name: /^K\/D/ })).toHaveAttribute("aria-sort", "descending");

    await user.click(within(table).getByRole("button", { name: /^K\/D/ }));
    expect(leaderboardRows()).toEqual(["bohdan", "anna", "chris"]);
  });

  it("keeps players without matches in the range at the bottom and still ranks their ELO", async () => {
    const user = userEvent.setup();
    const players = [...sampleSquad(), makePlayer({ nickname: "dana", elo: 2600, matches: [] })];
    renderWithI18n(<Dashboard players={players} failed={[]} updatedAt={UPDATED_AT} mapImages={{}} />);
    const table = screen.getByRole("table", { name: /Squad leaderboard/ });
    expect(leaderboardRows()).toEqual(["dana", "anna", "bohdan", "chris"]);
    expect(within(within(table).getByRole("row", { name: /dana/ })).getByText("1st place")).toBeInTheDocument();

    await user.click(within(table).getByRole("button", { name: /^K\/D/ }));
    await user.click(within(table).getByRole("button", { name: /^K\/D/ }));
    expect(leaderboardRows()).toEqual(["bohdan", "anna", "chris", "dana"]);
  });

  it("switches between a number of matches and a number of days and keeps it in the address", async () => {
    const user = userEvent.setup();
    renderDashboard();
    const range = screen.getByRole("group", { name: /Matches to include/ });

    await user.click(within(range).getByRole("radio", { name: "Last 30 days" }));
    expect(window.location.search).toBe("?range=30d");
    expect(screen.getByText(/compared over the last 30 days/)).toBeInTheDocument();
    for (const link of screen.getAllByRole("link", { name: "anna" })) {
      expect(link).toHaveAttribute("href", "/en/players/anna?range=30d");
    }

    await user.click(within(range).getByRole("radio", { name: "Last 7 days" }));
    expect(screen.getByRole("region", { name: "Recent matches" })).toHaveTextContent("No matches in this range");

    await user.click(within(range).getByRole("radio", { name: "Last 20 matches" }));
    expect(window.location.search).toBe("");
  });

  it("lists recent matches once, with everyone who played them", async () => {
    const user = userEvent.setup();
    renderDashboard();
    const feed = screen.getByRole("region", { name: "Recent matches" });
    expect(within(feed).getByText("Showing 8 of 9")).toBeInTheDocument();
    expect(within(feed).getAllByText("Together")).toHaveLength(2);
    await user.click(within(feed).getByRole("button", { name: "Show more matches" }));
    expect(within(feed).getByText("Showing 9 of 9")).toBeInTheDocument();
    expect(within(feed).queryByRole("button", { name: "Show more matches" })).not.toBeInTheDocument();
  });

  it("finds duos and records", () => {
    renderDashboard();
    const together = screen.getByRole("region", { name: "Playing together" });
    expect(within(together).getByText("2 matches")).toBeInTheDocument();
    const records = screen.getByRole("region", { name: "Records" });
    expect(within(records).getByText("1 ace")).toBeInTheDocument();
    expect(within(records).getAllByRole("link", { name: /^Match room for Anubis/ }).length).toBeGreaterThan(0);
  });

  it("warns about players that could not be loaded", () => {
    renderDashboard([{ nickname: "ghost", reason: "not-found" }]);
    expect(screen.getByRole("status")).toHaveTextContent("1 player could not be loaded");
    expect(screen.getByRole("status")).toHaveTextContent("ghost (not found on FACEIT)");
  });

  it("links to the same language", () => {
    renderDashboard([], "uk");
    for (const link of screen.getAllByRole("link", { name: "anna" })) {
      expect(link.getAttribute("href")).toMatch(/^\/uk\/players\/anna/);
    }
  });
});
