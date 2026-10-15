import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { i18nFor, renderWithI18n } from "@/test/render";

import Header from "./Header";

describe("Header", () => {
  it("links home and to both pages in the language of the page, keeping the range", () => {
    window.history.replaceState(null, "", "/uk/players/anna?range=50");
    renderWithI18n(<Header i18n={i18nFor("uk")} />, "uk");
    expect(screen.getByRole("link", { name: "Статистика, огляд скваду" })).toHaveAttribute("href", "/uk");
    const nav = screen.getByRole("navigation", { name: "Головна навігація" });
    expect(within(nav).getByRole("link", { name: "Сквад" })).toHaveAttribute("href", "/uk?range=50");
    expect(within(nav).getByRole("link", { name: "Сквад" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Порівняння" })).toHaveAttribute("href", "/uk/compare?range=50");
    expect(screen.getByRole("button", { name: "Налаштування" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /GitHub/ })).not.toBeInTheDocument();
  });

  it("marks the comparison as the current page", () => {
    window.history.replaceState(null, "", "/en/compare");
    renderWithI18n(<Header i18n={i18nFor("en")} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Compare" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Squad" })).not.toHaveAttribute("aria-current");
  });
});
