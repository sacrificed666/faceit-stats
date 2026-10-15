import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Skeleton from "../Skeleton/Skeleton";
import Notice from "./Notice";

describe("Notice", () => {
  it("announces warnings politely", () => {
    render(
      <Notice tone="warning" title="2 players could not be loaded">
        ghost (not found on FACEIT)
      </Notice>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("2 players could not be loaded");
    expect(screen.getByRole("status")).toHaveTextContent("ghost (not found on FACEIT)");
  });

  it("keeps information quiet", () => {
    render(<Notice title="Almost ready" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("Almost ready")).toBeInTheDocument();
  });
});

describe("Skeleton", () => {
  it("announces loading and hides the placeholders", () => {
    const { container } = render(
      <Skeleton label="Loading squad stats">
        <div>placeholder</div>
      </Skeleton>,
    );
    expect(container.querySelector("output")).toHaveTextContent("Loading squad stats…");
    expect(screen.getByText("placeholder").parentElement).toHaveAttribute("aria-hidden", "true");
  });
});
