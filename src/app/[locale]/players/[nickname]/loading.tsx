import { currentLocale, getI18n } from "@/shared/i18n/server";
import { cx } from "@/shared/lib/cx";
import Skeleton from "@/shared/ui/Skeleton/Skeleton";

import styles from "../../loading.module.scss";

// Placeholder for a player page while it renders
const PlayerLoading = async () => {
  const { t } = await getI18n(await currentLocale());
  return (
    <Skeleton label={t("loading.player")}>
      <div className={cx(styles.line, styles.crumb)} />
      <div className={cx(styles.panel, styles.hero)} />
      <div className={styles.form}>
        {["kd", "kr", "adr", "hs", "win", "record"].map((tile) => (
          <div key={tile} className={cx(styles.panel, styles.tile)} />
        ))}
      </div>
      <div className={cx(styles.panel, styles.chart)} />
    </Skeleton>
  );
};

export default PlayerLoading;
