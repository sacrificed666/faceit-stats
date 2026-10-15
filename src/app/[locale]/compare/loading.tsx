import { currentLocale, getI18n } from "@/shared/i18n/server";
import { cx } from "@/shared/lib/cx";
import Skeleton from "@/shared/ui/Skeleton/Skeleton";

import styles from "../loading.module.scss";

// Placeholder for the compare page while it renders
const CompareLoading = async () => {
  const { t } = await getI18n(await currentLocale());
  return (
    <Skeleton label={t("loading.compare")}>
      <div className={styles.heading}>
        <div className={cx(styles.line, styles.kicker)} />
        <div className={cx(styles.title, styles.titleWide)} />
      </div>
      <div className={cx(styles.panel, styles.picker)} />
      <div className={cx(styles.panel, styles.table)} />
    </Skeleton>
  );
};

export default CompareLoading;
