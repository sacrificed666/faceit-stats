import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { viewPlayers } from "@/features/squad/model/squad";
import { makeMatch, makePlayer } from "@/test/factories";
import { renderWithI18n } from "@/test/render";

import Rankings from "./Rankings";

const NOW = Date.UTC(2026, 9, 3);

// The ranked player names
const names = (): string[] => {
  const region = screen.getByRole("region", { name: "Rankings" });
  return within(within(region).getByRole("list"))
    .getAllByRole("link")
    .map((link) => link.textContent);
};

describe("Rankings", () => {
  it("ranks players by the chosen metric against the squad average", async () => {
    const user = userEvent.setup();
    const sharp = makePlayer({ nickname: "sharp", matches: [makeMatch({ kd: 2, adr: 70 })] });
    const heavy = makePlayer({ nickname: "heavy", matches: [makeMatch({ kd: 1, adr: 110 })] });
    const idle = makePlayer({ nickname: "idle", matches: [] });
    renderWithI18n(<Rankings views={viewPlayers([sharp, heavy, idle], "20", NOW)} />);

    expect(names()).toEqual(["sharp", "heavy"]);
    expect(screen.getByText("Squad average 1.50")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "ADR" }));
    expect(names()).toEqual(["heavy", "sharp"]);
    expect(screen.getByText("Squad average 90.0")).toBeInTheDocument();
  });

  it("explains an empty range", () => {
    renderWithI18n(<Rankings views={viewPlayers([makePlayer({ matches: [] })], "20", NOW)} />);
    expect(screen.getByText("No matches in this range")).toBeInTheDocument();
  });
});
