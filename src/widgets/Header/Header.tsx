import Link from "next/link";

import SettingsButton from "@/features/settings/ui/SettingsButton/SettingsButton";
import SettingsDialog from "@/features/settings/ui/SettingsDialog/SettingsDialog";
import HeaderNav from "@/features/squad/ui/HeaderNav/HeaderNav";
import type { I18n } from "@/shared/i18n/context";
import { homePath } from "@/shared/lib/urls";
import Logo from "@/shared/ui/Logo/Logo";

import styles from "./Header.module.scss";

interface HeaderProps {
  i18n: I18n;
}

// Logo, navigation and the settings button
const Header = ({ i18n: { locale, t } }: HeaderProps) => {
  const name = t("app.name");
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.home}>
          <Link href={homePath(locale)} aria-label={t("app.home", { app: name })} className={styles.brand}>
            <Logo size={32} className={styles.logo} />
            <span className={styles.name}>{name}</span>
          </Link>
        </div>
        <HeaderNav className={styles.nav} />
        <div className={styles.actions}>
          <SettingsButton />
          <SettingsDialog />
        </div>
      </div>
    </header>
  );
};

export default Header;
