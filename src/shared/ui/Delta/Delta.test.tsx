import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";

import Delta from "./Delta";

describe("Delta", () => {
  it("speaks a rise above the squad average", () => {
    const { container } = renderWithI18n(<Delta value={0.123} digits={2} />);
    expect(screen.getByText("+0.12, above the squad average")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("speaks a drop in percentage points", () => {
    renderWithI18n(<Delta value={-3.4} digits={1} points />);
    expect(screen.getByText(/^.3\.4 pp, below the squad average$/u)).toBeInTheDocument();
  });

  it("shows no arrow for a difference that rounds to zero", () => {
    const { container } = renderWithI18n(<Delta value={0.004} digits={2} />);
    expect(screen.getByText(/level with the squad average$/u)).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });
});
