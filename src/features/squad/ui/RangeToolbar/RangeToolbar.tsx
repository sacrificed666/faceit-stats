"use client";

import { useId } from "react";

import { DAY_RANGES, MATCH_RANGES, rangeSpec, type Range } from "@/features/squad/model/range";
import { setRange, useRange } from "@/features/squad/model/useRange";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";
import IconButton from "@/shared/ui/IconButton/IconButton";

import styles from "./RangeToolbar.module.scss";

type ToolbarSections = ReadonlyArray<{ id: string; label: string }>;

const NO_SECTIONS: ToolbarSections = [];

interface RangeToolbarProps {
  sections?: ToolbarSections;
}

// Floating toolbar with the range and links to the sections
const RangeToolbar = ({ sections = NO_SECTIONS }: RangeToolbarProps) => {
  const { t } = useI18n();
  const range = useRange();
  const name = useId();
  const menuId = `sections-${useId().replaceAll(":", "")}`;

  // One range as a radio with its full name for screen readers
  const option = (value: Range) => {
    const spec = rangeSpec(value);
    const title = t(spec.unit === "days" ? "range.option.days" : "range.option.matches", { count: spec.count });
    return (
      <label key={value} className={styles.option} title={title}>
        <input
          type="radio"
          name={name}
          value={value}
          checked={range === value}
          onChange={() => setRange(value)}
          className={styles.input}
        />
        <span aria-hidden="true" className={styles.choice}>
          {spec.count}
        </span>
        <span className="visually-hidden">{title}</span>
      </label>
    );
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.bar}>
        <fieldset className={styles.ranges}>
          <legend className="visually-hidden">{t("range.legend")}</legend>
          <span aria-hidden="true" className={styles.last}>
            {t("range.last")}
          </span>
          <span className={styles.group}>
            <span className={styles.options}>{DAY_RANGES.map(option)}</span>
            <span aria-hidden="true" className={styles.unit}>
              {t("range.days")}
            </span>
          </span>
          <span className={styles.group}>
            <span className={styles.options}>{MATCH_RANGES.map(option)}</span>
            <span aria-hidden="true" className={cx(styles.unit, styles.unitLast)}>
              {t("range.matches")}
            </span>
          </span>
        </fieldset>
        {sections.length > 0 ? (
          <nav aria-label={t("nav.sections")} className={styles.sections}>
            <ul className={styles.sectionList}>
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className={styles.sectionLink}>
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {sections.length > 0 ? (
          <div className={styles.menu}>
            <IconButton
              icon="list"
              label={t("nav.sections")}
              size="small"
              popoverTarget={menuId}
              className={styles.menuButton}
            />
            <nav id={menuId} popover="auto" aria-label={t("nav.sections")} className={styles.panel}>
              <ul className={styles.panelList}>
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={() => document.getElementById(menuId)?.hidePopover()}
                      className={styles.panelLink}
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RangeToolbar;
