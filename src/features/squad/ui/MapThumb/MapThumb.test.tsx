import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MapThumb, { MapImagesProvider } from "./MapThumb";

describe("MapThumb", () => {
  it("shows the squad's picture of the map and hides it from screen readers", () => {
    const { container } = render(
      <MapImagesProvider images={{ de_mirage: "https://assets.faceit-cdn.net/third_party/games/ce652bd4/mirage.jpg" }}>
        <MapThumb map="de_mirage" />
      </MapImagesProvider>,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("img")?.getAttribute("src")).toContain("mirage.jpg");
  });

  it("falls back to the initials of the map", () => {
    const { container } = render(<MapThumb map="de_anubis" />);
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("AN");
  });
});
