"use client";

import { useI18n } from "@/shared/i18n/useI18n";
import IconButton from "@/shared/ui/IconButton/IconButton";

import { SETTINGS_DIALOG_ID } from "../ids";

import styles from "./SettingsButton.module.scss";

// Opens the settings panel
const SettingsButton = () => {
  const { t } = useI18n();
  return (
    <IconButton
      icon="sliders"
      label={t("settings.open")}
      iconSize={20}
      popoverTarget={SETTINGS_DIALOG_ID}
      className={styles.button}
    />
  );
};

export default SettingsButton;
