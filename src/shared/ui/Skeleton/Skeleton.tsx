import type { ReactNode } from "react";

import styles from "./Skeleton.module.scss";

interface SkeletonProps {
  label: string;
  children: ReactNode;
}

// Pulsing placeholders with a spoken loading message
const Skeleton = ({ label, children }: SkeletonProps) => (
  <>
    <output className="visually-hidden">{`${label}…`}</output>
    <div aria-hidden="true" className={styles.placeholders}>
      {children}
    </div>
  </>
);

export default Skeleton;
