import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FALLBACK_MESSAGES } from "@/shared/i18n/fallback";
import { LOCALES } from "@/shared/i18n/locales";
import { createFallbackTranslator } from "@/shared/i18n/translate";
import { i18nFor } from "@/test/render";

import ErrorScreen from "./ErrorScreen";

describe("ErrorScreen", () => {
  it("explains the error, offers a retry and links home", async () => {
    const onRetry = vi.fn<() => void>();
    render(<ErrorScreen t={i18nFor("en").t} home="/en" digest="abc123" onRetry={onRetry} />);
    expect(screen.getByRole("heading", { level: 1, name: "Something went wrong" })).toBeInTheDocument();
    expect(screen.getByText("Error reference: abc123")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Squad overview" })).toHaveAttribute("href", "/en");
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("leaves out the reference when there is none", () => {
    render(<ErrorScreen t={i18nFor("uk").t} home="/uk" onRetry={vi.fn<() => void>()} />);
    expect(screen.queryByText(/abc123/u)).not.toBeInTheDocument();
  });

  it.each(LOCALES)("needs no message beyond the %s fallback", (locale) => {
    const t = createFallbackTranslator(locale, FALLBACK_MESSAGES[locale]);
    render(<ErrorScreen t={t} home={`/${locale}`} digest="abc123" onRetry={vi.fn<() => void>()} />);
    expect(document.body).not.toHaveTextContent(/error\./u);
  });
});
