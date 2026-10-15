import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";

import SquadLink from "./SquadLink";

describe("SquadLink", () => {
  it("links to the overview in the same language and range", () => {
    window.history.replaceState(null, "", "/pl/players/anna?range=90d");
    renderWithI18n(<SquadLink>Ekipa</SquadLink>, "pl");
    expect(screen.getByRole("link", { name: "Ekipa" })).toHaveAttribute("href", "/pl?range=90d");
  });
});
