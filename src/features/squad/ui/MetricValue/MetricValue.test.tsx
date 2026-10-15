import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";

import MetricValue from "./MetricValue";

describe("MetricValue", () => {
  it("colours good and weak values and leaves average ones alone", () => {
    renderWithI18n(
      <>
        <MetricValue metric="kd" value={1.42} />
        <MetricValue metric="kd" value={0.65} />
        <MetricValue metric="kd" value={1} />
        <MetricValue metric="winRate" value={65} digits={0} />
      </>,
    );
    expect(screen.getByText("1.42")).toHaveAttribute("data-tone", "good");
    expect(screen.getByText("0.65")).toHaveAttribute("data-tone", "bad");
    expect(screen.getByText("1.00")).not.toHaveAttribute("data-tone");
    expect(screen.getByText("65%")).toHaveAttribute("data-tone", "good");
  });
});
