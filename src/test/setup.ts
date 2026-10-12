import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, vi } from "vitest";

vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ href, children, ...props }: { href: string; children?: ReactNode } & Record<string, unknown>) =>
      createElement("a", { href, ...props }, children),
  };
});

vi.mock("next/image", async () => {
  const { createElement } = await import("react");
  return {
    default: ({
      src,
      alt,
      fill: _fill,
      unoptimized: _unoptimized,
      ...props
    }: { src: string; alt: string } & Record<string, unknown>) => createElement("img", { src, alt, ...props }),
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => window.location.pathname,
}));

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/en");
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.effects;
});
