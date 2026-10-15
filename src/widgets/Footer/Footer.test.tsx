import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SITE } from "@/shared/lib/site";
import { i18nFor, renderWithI18n } from "@/test/render";

import Footer from "./Footer";

vi.mock("next/cache", () => ({ cacheLife: vi.fn<(profile: string) => void>() }));

describe("Footer", () => {
  it("credits the author, the version and the FACEIT Data API in the language of the page", async () => {
    renderWithI18n(await Footer({ i18n: i18nFor("de") }), "de");
    expect(screen.getByText(`© ${new Date().getFullYear()}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /FACEIT Data API/ })).toHaveAttribute(
      "href",
      "https://docs.faceit.com/docs/data-api/data",
    );
    expect(screen.getByRole("link", { name: /Quellcode/ })).toHaveAttribute("href", SITE.repository);
    expect(screen.getByRole("link", { name: /^v1\.0\.0/ })).toHaveAttribute("href", SITE.changelog);
    expect(screen.queryByRole("link", { name: /Illia Movchko/ })).not.toBeInTheDocument();
  });

  it("tells screen readers that the links open a new tab", async () => {
    renderWithI18n(await Footer({ i18n: i18nFor("en") }));
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveTextContent("(opens in a new tab)");
    }
  });
});
