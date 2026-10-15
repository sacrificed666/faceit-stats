import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";
import { sampleSquad } from "@/test/squad";

import ComparePage from "./ComparePage";

// Renders the comparison at an address
const renderCompare = (path = "/en/compare") => {
  window.history.replaceState(null, "", path);
  renderWithI18n(<ComparePage players={sampleSquad()} updatedAt={Date.UTC(2026, 8, 20, 12)} mapImages={{}} />);
};

// The two player pickers
const pickers = () => [
  screen.getByRole("combobox", { name: "First player" }),
  screen.getByRole("combobox", { name: "Second player" }),
];

describe("ComparePage", () => {
  it("starts with the two highest rated players", () => {
    renderCompare();
    const [first, second] = pickers();
    expect(first).toHaveValue("anna");
    expect(second).toHaveValue("bohdan");
  });

  it("reads the players from the address in any letter case", () => {
    renderCompare("/en/compare?a=CHRIS&b=anna");
    const [first, second] = pickers();
    expect(first).toHaveValue("chris");
    expect(second).toHaveValue("anna");
  });

  it("summarises the matches played together and against each other", () => {
    renderCompare();
    const summary = screen.getByRole("region", { name: "Players to compare" });
    expect(within(summary).getByText("2 matches, 1-1")).toBeInTheDocument();
    expect(within(summary).getByText("Never")).toBeInTheDocument();
  });

  it("swaps the players and keeps the address in sync", async () => {
    const user = userEvent.setup();
    renderCompare();
    await user.click(screen.getByRole("button", { name: "Swap players" }));
    expect(window.location.search).toBe("?a=bohdan&b=anna");
    expect(pickers()[0]).toHaveValue("bohdan");
  });

  it("swaps instead of comparing a player with themselves", async () => {
    const user = userEvent.setup();
    renderCompare();
    await user.selectOptions(pickers()[0]!, "bohdan");
    expect(window.location.search).toBe("?a=bohdan&b=anna");
  });

  it("names the leader of each ranked row", () => {
    renderCompare();
    const stats = screen.getByRole("table", { name: "Form" });
    expect(within(stats).getByRole("rowheader", { name: "Kills per death, anna is ahead" })).toBeInTheDocument();
    expect(within(stats).getByRole("rowheader", { name: "Matches" })).toBeInTheDocument();
  });

  it("lists every shared match with the result of each side", () => {
    renderCompare();
    const shared = screen.getByRole("region", { name: "Shared matches" });
    expect(within(shared).getAllByText("Same team")).toHaveLength(2);
    expect(within(shared).getByRole("link", { name: /Match room for Nuke/ })).toHaveAttribute(
      "href",
      "https://www.faceit.com/en/cs2/room/shared-win",
    );
  });
});
