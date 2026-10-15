import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SortHeader from "./SortHeader";

// A sortable header in the head of a table
const renderHeader = (active: boolean, direction: "asc" | "desc", onSort = vi.fn<() => void>()) => {
  render(
    <table>
      <thead>
        <tr>
          <SortHeader label="K/D" title="Kills per death" active={active} direction={direction} onSort={onSort} />
        </tr>
      </thead>
    </table>,
  );
  return onSort;
};

describe("SortHeader", () => {
  it("reports the order of the sorted column and sorts on click", async () => {
    const onSort = renderHeader(true, "asc");
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "ascending");
    await userEvent.setup().click(screen.getByRole("button", { name: /^K\/D, Kills per death$/u }));
    expect(onSort).toHaveBeenCalledOnce();
  });

  it("leaves the order out on other columns", () => {
    renderHeader(false, "desc");
    expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort");
  });
});
