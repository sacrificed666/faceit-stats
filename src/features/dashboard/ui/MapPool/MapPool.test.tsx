import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { viewPlayers } from "@/features/squad/model/squad";
import { makeMatch, makePlayer } from "@/test/factories";
import { renderWithI18n } from "@/test/render";

import MapPool from "./MapPool";

const NOW = Date.UTC(2026, 9, 3);

// Renders the map pool for the sample squad
const renderPool = () => {
  const once = makePlayer({ nickname: "once", matches: [makeMatch({ map: "de_nuke", won: true, kd: 1.6 })] });
  const often = makePlayer({
    nickname: "often",
    matches: Array.from({ length: 5 }, () => makeMatch({ map: "de_nuke", won: true, kd: 1.6 })),
  });
  renderWithI18n(<MapPool views={viewPlayers([once, often], "20", NOW)} />);
};

// The heatmap cell of a player
const cell = (player: string): HTMLElement => {
  const table = screen.getByRole("table", { name: /Map pool/ });
  return within(within(table).getByRole("row", { name: new RegExp(player) })).getAllByRole("cell")[0]!;
};

describe("MapPool", () => {
  it("colours win rates and pales cells with few matches", () => {
    renderPool();
    expect(screen.getByText(/Green is above 50%, red is below/)).toBeInTheDocument();
    expect(cell("once")).toHaveTextContent("100%1 match");
    expect(cell("once").style.getPropertyValue("--heat")).toBe("0.200");
    expect(cell("often").style.getPropertyValue("--heat")).toBe("1.000");
    expect(cell("often").style.getPropertyValue("--heat-pole")).toBe("var(--div-positive)");
  });

  it("switches to K/D and to the number of matches", async () => {
    const user = userEvent.setup();
    renderPool();
    await user.click(screen.getByRole("radio", { name: "K/D" }));
    expect(cell("often")).toHaveTextContent("1.60");
    expect(screen.getByText("Above 1.00")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Matches" }));
    expect(cell("often")).toHaveTextContent(/^5$/);
    expect(cell("often").style.getPropertyValue("--heat-pole")).toBe("var(--data)");
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("adds up the whole squad", () => {
    renderPool();
    const table = screen.getByRole("table", { name: /Map pool/ });
    expect(within(table).getByRole("row", { name: /Whole squad/ })).toHaveTextContent("100%6 matches");
  });
});
