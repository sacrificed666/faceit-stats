import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JsonLd from "./JsonLd";

describe("JsonLd", () => {
  it("embeds escaped structured data", () => {
    const { container } = render(<JsonLd data={{ "@type": "Person", name: "</script>" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).not.toContain("</script>");
    expect(JSON.parse(script?.textContent ?? "null")).toEqual({ "@type": "Person", name: "</script>" });
  });
});
