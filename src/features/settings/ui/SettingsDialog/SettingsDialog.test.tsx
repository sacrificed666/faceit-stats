import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";

import SettingsButton from "../SettingsButton/SettingsButton";
import SettingsDialog from "./SettingsDialog";

afterEach(() => {
  document.cookie = "faceit-stats-locale=; path=/; max-age=0";
});

// An option of a settings group
const choice = (group: string, name: string) =>
  within(screen.getByRole("group", { name: group, hidden: true })).getByRole("radio", { name, hidden: true });

describe("SettingsDialog", () => {
  it("opens a labelled panel from the settings button", () => {
    renderWithI18n(
      <>
        <SettingsButton />
        <SettingsDialog />
      </>,
      "uk",
    );
    const button = screen.getByRole("button", { name: "Налаштування" });
    const panel = document.getElementById(button.getAttribute("popovertarget") ?? "");
    expect(panel).toHaveAttribute("popover", "auto");
    expect(document.getElementById(panel?.getAttribute("aria-labelledby") ?? "")).toHaveTextContent("Налаштування");
    expect(screen.getByRole("button", { name: "Закрити", hidden: true })).toHaveAttribute(
      "popovertargetaction",
      "hide",
    );
  });

  it("links every language to the same page with the same filters", () => {
    window.history.replaceState(null, "", "/en/players/sacrificed?range=50");
    renderWithI18n(<SettingsDialog />);
    expect(screen.getAllByRole("link", { hidden: true }).map((link) => link.getAttribute("href"))).toEqual([
      "/en/players/sacrificed?range=50",
      "/uk/players/sacrificed?range=50",
      "/cs/players/sacrificed?range=50",
      "/de/players/sacrificed?range=50",
      "/es/players/sacrificed?range=50",
      "/fr/players/sacrificed?range=50",
      "/it/players/sacrificed?range=50",
      "/nl/players/sacrificed?range=50",
      "/pl/players/sacrificed?range=50",
      "/pt/players/sacrificed?range=50",
    ]);
    expect(screen.getByRole("link", { name: "English", hidden: true })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Čeština", hidden: true })).toHaveAttribute("hreflang", "cs");
  });

  it("remembers the chosen language", async () => {
    const user = userEvent.setup();
    renderWithI18n(<SettingsDialog />);
    const portuguese = screen.getByRole("link", { name: "Português", hidden: true });
    portuguese.addEventListener("click", (event) => event.preventDefault());
    await user.click(portuguese);
    expect(document.cookie).toContain("faceit-stats-locale=pt");
  });

  it("follows the system theme by default", () => {
    renderWithI18n(<SettingsDialog />);
    expect(choice("Appearance", "Auto")).toBeChecked();
  });

  it("stores an explicit theme and returns to the system theme", async () => {
    const user = userEvent.setup();
    renderWithI18n(<SettingsDialog />);

    await user.click(choice("Appearance", "Dark"));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("faceit-stats/theme")).toBe("dark");
    expect(choice("Appearance", "Dark")).toBeChecked();

    await user.click(choice("Appearance", "Auto"));
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(localStorage.getItem("faceit-stats/theme")).toBeNull();
  });

  it("picks the effects level for the device and stores an explicit one", async () => {
    const user = userEvent.setup();
    renderWithI18n(<SettingsDialog />);
    expect(choice("Effects", "Auto")).toBeChecked();
    expect(screen.getByText("On this device: Reduced")).toBeInTheDocument();

    await user.click(choice("Effects", "Full"));
    expect(document.documentElement.dataset.effects).toBe("full");
    expect(localStorage.getItem("faceit-stats/effects")).toBe("full");
    expect(screen.queryByText("On this device: Reduced")).not.toBeInTheDocument();

    await user.click(choice("Effects", "Auto"));
    expect(document.documentElement.dataset.effects).toBe("reduced");
    expect(localStorage.getItem("faceit-stats/effects")).toBeNull();
  });

  it("keeps the browser theme color in sync with an explicit choice", async () => {
    const user = userEvent.setup();
    const light = Object.assign(document.createElement("meta"), {
      name: "theme-color",
      media: "(prefers-color-scheme: light)",
      content: "#f3f3f0",
    });
    const dark = Object.assign(document.createElement("meta"), {
      name: "theme-color",
      media: "(prefers-color-scheme: dark)",
      content: "#0f1011",
    });
    document.head.append(light, dark);
    renderWithI18n(<SettingsDialog />);

    await user.click(choice("Appearance", "Dark"));
    expect([light.content, dark.content]).toEqual(["#0f1011", "#0f1011"]);

    await user.click(choice("Appearance", "Auto"));
    expect([light.content, dark.content]).toEqual(["#f3f3f0", "#0f1011"]);
    light.remove();
    dark.remove();
  });
});
