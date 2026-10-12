import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createFormatter } from "@/shared/lib/format";
import { niceScale } from "@/shared/lib/scale";
import { renderWithI18n } from "@/test/render";

import LineChart from "./LineChart";

const POINTS = [
  { key: "a", label: "1 Sep 2026", detail: "Mirage · Win 13:7" },
  { key: "b", label: "2 Sep 2026", detail: "Nuke · Loss 9:13" },
  { key: "c", label: "3 Sep 2026", detail: "Ancient · Win 13:11" },
];

// Renders the chart with sample matches
const renderChart = () =>
  renderWithI18n(
    <LineChart
      label="K/D per match for sacrificed"
      points={POINTS}
      scale={niceScale([0.4, 2.1], 3)}
      format={(value) => createFormatter("en").decimal(value, 2)}
      reference={{ value: 1.1, label: "Squad average" }}
      series={[
        { id: "match", label: "Match", tone: "context", values: [1.5, 0.4, 2.1] },
        { id: "rolling", label: "Average", tone: "data", values: [1.5, 0.95, 1.33] },
      ]}
    />,
  );

describe("LineChart", () => {
  it("exposes the matches through a keyboard-friendly slider", () => {
    renderChart();
    const slider = screen.getByRole("slider", { name: "K/D per match for sacrificed" });
    expect(slider).toHaveAttribute("aria-valuetext", "3 Sep 2026, Ancient · Win 13:11: Match 2.10, Average 1.33");

    fireEvent.change(slider, { target: { value: "0" } });
    expect(slider).toHaveAttribute("aria-valuetext", "1 Sep 2026, Mirage · Win 13:7: Match 1.50, Average 1.50");
  });

  it("shows a tooltip for the active match and hides it on blur", () => {
    renderChart();
    const slider = screen.getByRole("slider");
    fireEvent.focus(slider);
    expect(screen.getByText(/Ancient · Win 13:11/)).toBeInTheDocument();
    fireEvent.blur(slider);
    expect(screen.queryByText(/Ancient · Win 13:11/)).not.toBeInTheDocument();
  });

  it("labels the y axis with the scale ticks", () => {
    const { container } = renderChart();
    expect([...container.querySelectorAll("[aria-hidden='true'] > span")].map((tick) => tick.textContent)).toEqual(
      expect.arrayContaining(["0.00", "1.00", "2.00", "3.00"]),
    );
  });

  it("follows the pointer across the plot", () => {
    renderChart();
    const plot = screen.getByRole("slider").nextElementSibling;
    if (!(plot instanceof HTMLElement)) throw new Error("The chart needs a plot area");
    plot.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: 0, width: 300, height: 100 });
    fireEvent.pointerMove(plot, { clientX: 10 });
    expect(screen.getByText(/Mirage · Win 13:7/)).toBeInTheDocument();
    fireEvent.pointerLeave(plot);
    expect(screen.queryByText(/Mirage · Win 13:7/)).not.toBeInTheDocument();
  });

  it("keeps a touched reading until the next touch somewhere else", () => {
    renderChart();
    const plot = screen.getByRole("slider").nextElementSibling;
    if (!(plot instanceof HTMLElement)) throw new Error("The chart needs a plot area");
    plot.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: 0, width: 300, height: 100 });
    fireEvent.pointerDown(plot, { clientX: 10, pointerType: "touch" });
    fireEvent.pointerLeave(plot, { pointerType: "touch" });
    expect(screen.getByText(/Mirage · Win 13:7/)).toBeInTheDocument();
    fireEvent.pointerDown(document.body, { pointerType: "touch" });
    expect(screen.queryByText(/Mirage · Win 13:7/)).not.toBeInTheDocument();
  });

  it("marks a single match with a dot", () => {
    renderWithI18n(
      <LineChart
        label="K/D per match for solo"
        points={[POINTS[0]!]}
        scale={niceScale([1.5], 3)}
        format={(value) => createFormatter("en").decimal(value, 2)}
        series={[{ id: "match", label: "Match", tone: "data", values: [1.5] }]}
      />,
    );
    const plot = screen.getByRole("slider").nextElementSibling;
    expect(plot?.querySelectorAll(":scope > span[aria-hidden='true']")).toHaveLength(1);
  });
});
