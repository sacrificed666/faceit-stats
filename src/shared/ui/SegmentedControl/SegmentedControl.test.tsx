import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/test/render";

import SegmentedControl from "./SegmentedControl";

const OPTIONS = [
  { value: "kd", label: "K/D" },
  { value: "adr", label: "ADR" },
] as const;

describe("SegmentedControl", () => {
  it("renders a named group of radio buttons", () => {
    renderWithI18n(
      <SegmentedControl label="Metric" options={OPTIONS} value="kd" onChange={vi.fn<(value: string) => void>()} />,
    );
    expect(screen.getByRole("group", { name: "Metric" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "K/D" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "ADR" })).not.toBeChecked();
  });

  it("reports the chosen option", async () => {
    const onChange = vi.fn<(value: string) => void>();
    renderWithI18n(<SegmentedControl label="Metric" options={OPTIONS} value="kd" onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "ADR" }));
    expect(onChange).toHaveBeenCalledWith("adr");
  });
});
