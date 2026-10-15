import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Avatar from "./Avatar";

describe("Avatar", () => {
  it("shows the picture and falls back to the initial when it cannot be loaded", () => {
    const { container } = render(<Avatar src="https://assets.faceit-cdn.net/a.png" name="sacrificed" />);
    const image = container.querySelector("img");
    expect(image).toHaveAttribute("src", "https://assets.faceit-cdn.net/a.png");
    fireEvent.error(image!);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("shows the initial without a picture", () => {
    render(<Avatar src={null} name="z0nGa" size={30} />);
    expect(screen.getByText("Z")).toHaveStyle({ width: "30px", height: "30px" });
  });
});
