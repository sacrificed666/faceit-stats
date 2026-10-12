"use client";

import { usePathname } from "next/navigation";
import { useId } from "react";

import { useSearch } from "@/shared/hooks/useQuery";
import { LOCALE_COOKIE, LOCALE_INFO, LOCALES, switchLocale, type Locale } from "@/shared/i18n/locales";
import type { MessageKey } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";
import type { Effects } from "@/shared/lib/effects";
import type { ThemePreference } from "@/shared/lib/theme";
import Flag from "@/shared/ui/Flag/Flag";
import type { IconName } from "@/shared/ui/Icon/icons";
import IconButton from "@/shared/ui/IconButton/IconButton";
import SegmentedControl from "@/shared/ui/SegmentedControl/SegmentedControl";

import { setEffects, useDeviceEffects, useEffects } from "../../model/useEffects";
import { setTheme, useTheme } from "../../model/useTheme";
import { SETTINGS_DIALOG_ID } from "../ids";

import styles from "./SettingsDialog.module.scss";

const ONE_YEAR = 60 * 60 * 24 * 365;

const THEMES: ReadonlyArray<{ value: ThemePreference; label: MessageKey; icon: IconName }> = [
  { value: "system", label: "settings.theme.system", icon: "monitor" },
  { value: "light", label: "settings.theme.light", icon: "sun" },
  { value: "dark", label: "settings.theme.dark", icon: "moon" },
];

const EFFECT_OPTIONS: ReadonlyArray<{ value: Effects; label: MessageKey }> = [
  { value: "auto", label: "settings.effects.auto" },
  { value: "full", label: "settings.effects.full" },
  { value: "reduced", label: "settings.effects.reduced" },
];

// Remembers the language for the next visit to the bare address
const rememberLocale = (locale: Locale) => {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax${secure}`;
};

// Settings panel: appearance, effects and language
const SettingsDialog = () => {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const search = useSearch();
  const theme = useTheme();
  const effects = useEffects();
  const device = useDeviceEffects();
  const titleId = useId();
  const languagesId = useId();

  return (
    <dialog id={SETTINGS_DIALOG_ID} popover="auto" aria-labelledby={titleId} className={styles.panel}>
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {t("settings.title")}
        </h2>
        <IconButton
          icon="close"
          label={t("settings.close")}
          variant="inset"
          size="small"
          iconSize={16}
          popoverTarget={SETTINGS_DIALOG_ID}
          popoverTargetAction="hide"
        />
      </div>
      <SegmentedControl
        label={t("settings.theme")}
        fill
        options={THEMES.map((entry) => ({ value: entry.value, label: t(entry.label), icon: entry.icon }))}
        value={theme}
        onChange={setTheme}
      />
      <SegmentedControl
        label={t("settings.effects")}
        fill
        options={EFFECT_OPTIONS.map((entry) => ({ value: entry.value, label: t(entry.label) }))}
        value={effects}
        description={
          effects === "auto" && device
            ? t("settings.effects.device", { mode: t(`settings.effects.${device}`) })
            : undefined
        }
        onChange={setEffects}
      />
      <div className={styles.languages}>
        <h3 id={languagesId} className={styles.legend}>
          {t("settings.language")}
        </h3>
        <ul aria-labelledby={languagesId} className={styles.grid}>
          {LOCALES.map((entry) => (
            <li key={entry}>
              <a
                href={`${switchLocale(pathname, entry)}${search}`}
                hrefLang={entry}
                lang={entry}
                aria-current={entry === locale ? "true" : undefined}
                onClick={() => rememberLocale(entry)}
                className={styles.language}
              >
                <Flag country={LOCALE_INFO[entry].flag} height={14} />
                {LOCALE_INFO[entry].name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
};

export default SettingsDialog;
