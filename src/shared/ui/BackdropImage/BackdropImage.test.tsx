import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BackdropImage from "./BackdropImage";

describe("BackdropImage", () => {
  it("shows the cover and hides it when it cannot be loaded", () => {
    const { container } = render(<BackdropImage src="https://assets.faceit-cdn.net/de_nuke.jpg" sizes="100vw" eager />);
    const image = container.querySelector("img");
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("loading", "eager");
    fireEvent.error(image!);
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders nothing without a picture and loads lazily by default", () => {
    const empty = render(<BackdropImage src={null} sizes="100vw" />);
    expect(empty.container).toBeEmptyDOMElement();
    const lazy = render(<BackdropImage src="https://assets.faceit-cdn.net/de_inferno.jpg" sizes="50vw" />);
    expect(lazy.container.querySelector("img")).toHaveAttribute("loading", "lazy");
  });
});
