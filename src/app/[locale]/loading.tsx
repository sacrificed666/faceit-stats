import { currentLocale, getI18n } from "@/shared/i18n/server";
import { cx } from "@/shared/lib/cx";
import Skeleton from "@/shared/ui/Skeleton/Skeleton";

import styles from "./loading.module.scss";

// Placeholder for the squad overview while it renders
const Loading = async () => {
  const { t } = await getI18n(await currentLocale());
  return (
    <Skeleton label={t("loading.squad")}>
      <div className={styles.heading}>
        <div className={cx(styles.line, styles.kicker)} />
        <div className={styles.title} />
        <div className={cx(styles.line, styles.lead)} />
      </div>
      <div className={styles.tiles}>
        {["elo", "kd", "win", "together", "streak"].map((tile) => (
          <div key={tile} className={cx(styles.panel, styles.tile)} />
        ))}
      </div>
      <div className={styles.cards}>
        {["a", "b", "c", "d", "e"].map((card) => (
          <div key={card} className={cx(styles.panel, styles.card)} />
        ))}
      </div>
    </Skeleton>
  );
};

export default Loading;
