import type { Metadata } from "next";
import Link from "next/link";

import { rich } from "@/shared/i18n/rich";
import { currentLocale, getI18n } from "@/shared/i18n/server";
import { homePath } from "@/shared/lib/urls";
import Icon from "@/shared/ui/Icon/Icon";

import styles from "../not-found.module.scss";

// Keeps the not found page out of search results
export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n(await currentLocale());
  return { title: t("notFound.meta"), robots: { index: false, follow: true } };
};

// Not found page for an unknown player or address
const NotFound = async () => {
  const locale = await currentLocale();
  const { t } = await getI18n(locale);
  return (
    <div className={styles.notFound}>
      <p className={styles.code}>404</p>
      <div className={styles.text}>
        <h1 className={styles.title}>{t("notFound.title")}</h1>
        <p className={styles.body}>
          {rich(t("notFound.body"), {
            variable: <code className={styles.variable}>FACEIT_PLAYERS</code>,
          })}
        </p>
      </div>
      <Link href={homePath(locale)} className={styles.home}>
        <Icon name="home" size={16} />
        {t("notFound.home")}
      </Link>
    </div>
  );
};

export default NotFound;
