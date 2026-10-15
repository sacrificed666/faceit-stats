import Link from "next/link";

import type { Locale } from "@/shared/i18n/locales";
import type { Translate } from "@/shared/i18n/translate";
import Icon from "@/shared/ui/Icon/Icon";

import styles from "./ErrorScreen.module.scss";

interface ErrorScreenProps {
  t: Translate;
  home: `/${Locale}`;
  digest?: string;
  onRetry: () => void;
}

// What went wrong, with a way to try again and a link home
const ErrorScreen = ({ t, home, digest, onRetry }: ErrorScreenProps) => (
  <div className={styles.screen}>
    <span className={styles.icon}>
      <Icon name="alert" size={24} />
    </span>
    <div className={styles.text}>
      <h1 className={styles.title}>{t("error.title")}</h1>
      <p className={styles.body}>{t("error.body")}</p>
      {digest ? <p className={styles.reference}>{t("error.reference", { digest })}</p> : null}
    </div>
    <div className={styles.actions}>
      <button type="button" onClick={onRetry} className={styles.retry}>
        <Icon name="refresh" size={16} />
        {t("error.retry")}
      </button>
      <Link href={home} className={styles.home}>
        <Icon name="home" size={16} />
        {t("error.home")}
      </Link>
    </div>
  </div>
);

export default ErrorScreen;
