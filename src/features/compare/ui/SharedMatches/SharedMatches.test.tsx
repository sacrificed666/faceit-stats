import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeMatch } from "@/test/factories";
import { renderWithI18n } from "@/test/render";

import SharedMatches from "./SharedMatches";

const together = {
  id: "1-together",
  finishedAt: Date.UTC(2026, 9, 1, 18),
  map: "de_nuke",
  together: true,
  first: makeMatch({ won: true, teamScore: 13, opponentScore: 7, kills: 24 }),
  second: makeMatch({ won: true, teamScore: 13, opponentScore: 7, kills: 15 }),
};

const against = {
  id: "1-against",
  finishedAt: Date.UTC(2026, 9, 2, 18),
  map: "de_mirage",
  together: false,
  first: makeMatch({ won: false, kills: 11 }),
  second: makeMatch({ won: true, kills: 27 }),
};

describe("SharedMatches", () => {
  it("lists matches played together and against each other with their rooms", () => {
    renderWithI18n(<SharedMatches shared={[together, against]} firstName="anna" secondName="dana" />);
    const table = screen.getByRole("table", { name: "Shared matches" });
    const [, first, second] = within(table).getAllByRole("row");
    expect(first).toHaveTextContent("Same team");
    expect(first).toHaveTextContent("13:7");
    expect(second).toHaveTextContent("Opponents");
    expect(second).toHaveTextContent("dana won");
    expect(screen.getByRole("link", { name: "Match room for Nuke (opens in a new tab)" })).toHaveAttribute(
      "href",
      "https://www.faceit.com/en/cs2/room/1-together",
    );
  });

  it("says when the two never met in the range", () => {
    renderWithI18n(<SharedMatches shared={[]} firstName="anna" secondName="dana" />);
    expect(screen.getByText("These two have not played a match together in this range.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
