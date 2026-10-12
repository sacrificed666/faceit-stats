import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { i18nFor } from "@/test/render";

import SquadStatus from "./SquadStatus";

const i18n = i18nFor();

describe("SquadStatus", () => {
  it("lists the settings that are still missing", () => {
    render(
      <SquadStatus problem={{ status: "unconfigured", missing: ["FACEIT_API_KEY", "FACEIT_PLAYERS"] }} i18n={i18n} />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Almost ready" })).toBeInTheDocument();
    expect(screen.getByText("FACEIT_API_KEY")).toBeInTheDocument();
    expect(screen.getByText("comma-separated FACEIT nicknames")).toBeInTheDocument();
  });

  it("explains a rejected API key", () => {
    render(<SquadStatus problem={{ status: "unavailable", reason: "unauthorized" }} i18n={i18n} />);
    expect(screen.getByRole("heading", { level: 2, name: "FACEIT rejected the API key" })).toBeInTheDocument();
  });

  it("explains outages", () => {
    render(<SquadStatus problem={{ status: "unavailable", reason: "rate-limited" }} i18n={i18n} />);
    expect(screen.getByRole("heading", { level: 2, name: "FACEIT is rate limiting requests" })).toBeInTheDocument();
  });

  it("names the players FACEIT does not know", () => {
    render(
      <SquadStatus problem={{ status: "empty", failed: [{ nickname: "ghost", reason: "not-found" }] }} i18n={i18n} />,
    );
    expect(screen.getByText(/FACEIT does not know ghost/)).toBeInTheDocument();
  });

  it("speaks the visitor's language", () => {
    render(<SquadStatus problem={{ status: "unavailable", reason: "unreachable" }} i18n={i18nFor("uk")} />);
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveTextContent("Squad stats");
  });
});
