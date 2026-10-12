import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import QueryReady from "./QueryReady";

describe("QueryReady", () => {
  it("reveals the data once the address has been applied", async () => {
    document.documentElement.dataset.pending = "";
    render(<QueryReady />);
    await waitFor(() => expect(document.documentElement.dataset.pending).toBeUndefined());
  });
});
