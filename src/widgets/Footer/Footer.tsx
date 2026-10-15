import { cacheLife } from "next/cache";

import type { I18n } from "@/shared/i18n/context";
import { rich } from "@/shared/i18n/rich";
import { cx } from "@/shared/lib/cx";
import { SITE } from "@/shared/lib/site";
import ExternalLink from "@/shared/ui/ExternalLink/ExternalLink";

import styles from "./Footer.module.scss";

// The year for the copyright line, cached for a day
const currentYear = async (): Promise<number> => {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
};

interface FooterProps {
  i18n: I18n;
}

// Author, version, data source and source code
const Footer = async ({ i18n: { t } }: FooterProps) => {
  const year = await currentYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.bar}>
        <p className={styles.owner}>
          {`© ${year} ${SITE.author.name}`}
          <span aria-hidden="true" className={styles.dot}>
            ·
          </span>
          <ExternalLink href={SITE.changelog} icon={false} className={cx(styles.link, styles.version)}>
            {`v${SITE.version}`}
          </ExternalLink>
        </p>
        <p className={styles.links}>
          <span>
            {rich(t("footer.data"), {
              api: (
                <ExternalLink href="https://docs.faceit.com/docs/data-api/data" icon={false} className={styles.link}>
                  {t("footer.api")}
                </ExternalLink>
              ),
            })}
          </span>
          <ExternalLink href={SITE.repository} icon={false} className={styles.link}>
            {t("footer.source")}
          </ExternalLink>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
