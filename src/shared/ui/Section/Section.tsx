import type { ReactNode } from "react";

import { cx } from "@/shared/lib/cx";

import styles from "./Section.module.scss";

interface SectionProps {
  id: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

// A titled region with a description and optional actions
const Section = ({ id, title, description, actions, children, className }: SectionProps) => {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={cx(styles.section, className)}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {children}
    </section>
  );
};

export default Section;
