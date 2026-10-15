import Image from "next/image";

import { cx } from "@/shared/lib/cx";
import { flagUrl } from "@/shared/lib/urls";

import styles from "./Flag.module.scss";

interface FlagProps {
  country: string;
  height?: number;
  label?: string;
  className?: string;
}

// A country flag served by the app, named only when no text says the country
const Flag = ({ country, height = 16, label, className }: FlagProps) => {
  const width = Math.round((height * 3) / 2);
  return (
    <Image
      src={flagUrl(country)}
      alt={label ?? ""}
      title={label}
      width={width}
      height={height}
      unoptimized
      className={cx(styles.flag, className)}
      style={{ width, height }}
    />
  );
};

export default Flag;
