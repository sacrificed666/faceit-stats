import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BarList from "./BarList";

const items = [
  { id: "anna", label: "anna", value: 1.2, display: "1.20", detail: "48 matches" },
  { id: "dana", label: "dana", value: 0.6, display: "0.60", emphasis: false },
  { id: "chris", label: "chris", value: 0, display: "0.00" },
];

// The bar widths of the rendered rows
const widths = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>("li")].map((row) =>
    row.querySelector<HTMLElement>("[style]")?.style.getPropertyValue("--bar"),
  );

describe("BarList", () => {
  it("ranks the rows on one scale and keeps small values visible", () => {
    const { container } = render(<BarList items={items} />);
    expect(screen.getByRole("list").tagName).toBe("OL");
    expect(widths(container)).toEqual(["100%", "50%", "0%"]);
    expect(screen.getByText("48 matches")).toBeInTheDocument();
    expect(container.querySelector(".mark-muted")).toBeInTheDocument();
  });

  it("draws a reference line with its legend and honours a larger maximum", () => {
    const { container } = render(
      <BarList items={items} max={2} reference={{ value: 1, label: "Squad average" }} ordered={false} />,
    );
    expect(screen.getByRole("list").tagName).toBe("UL");
    expect(widths(container)[0]).toBe("60%");
    expect(container.querySelector(".mark-line")).toHaveStyle({ left: "50%" });
    expect(screen.getByText("Squad average")).toBeInTheDocument();
  });

  it("gives a value close to zero a sliver of a bar", () => {
    const { container } = render(<BarList items={[{ id: "a", label: "a", value: 0.001, display: "0.00" }]} max={10} />);
    expect(widths(container)).toEqual(["1.5%"]);
  });
});
