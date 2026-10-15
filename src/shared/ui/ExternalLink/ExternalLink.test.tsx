import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";

import ExternalLink from "./ExternalLink";

describe("ExternalLink", () => {
  it("opens another site in a new tab and says so", () => {
    renderWithI18n(<ExternalLink href="https://www.faceit.com">FACEIT</ExternalLink>);
    const link = screen.getByRole("link", { name: /^FACEIT ?\(opens in a new tab\)$/u });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.querySelector("svg")).toBeInTheDocument();
  });

  it("uses the given label and leaves out the arrow on request", () => {
    renderWithI18n(
      <ExternalLink
        href="https://steamcommunity.com"
        label="Steam profile"
        context="anna"
        icon={false}
        variant="icon"
      />,
    );
    const link = screen.getByRole("link", { name: "Steam profile (opens in a new tab)" });
    expect(link).toHaveTextContent("anna");
    expect(link.querySelector("svg")).toBeNull();
  });
});
