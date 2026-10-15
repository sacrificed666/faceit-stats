"use client";

import Link from "next/link";

import type { Player } from "@/features/squad/model/types";
import { useRange, withRange } from "@/features/squad/model/useRange";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";
import { playerPath } from "@/shared/lib/urls";
import Avatar from "@/shared/ui/Avatar/Avatar";
import Flag from "@/shared/ui/Flag/Flag";

import styles from "./PlayerName.module.scss";

interface PlayerNameProps {
  player: Pick<Player, "nickname" | "avatar" | "country">;
  size?: number;
  flag?: boolean;
  link?: boolean;
  avatar?: boolean;
  truncate?: boolean;
  className?: string;
}

// Avatar and nickname linking to the player page in the current range
const PlayerName = ({
  player,
  size = 28,
  flag = false,
  link = true,
  avatar = true,
  truncate = true,
  className,
}: PlayerNameProps) => {
  const { locale, format } = useI18n();
  const range = useRange();
  const name = <span className={styles.name}>{player.nickname}</span>;
  return (
    <span className={cx(styles.player, !truncate && styles.whole, className)}>
      {avatar ? <Avatar src={player.avatar} name={player.nickname} size={size} /> : null}
      {link ? (
        <Link href={withRange(playerPath(locale, player.nickname), range)} className={styles.link}>
          {name}
        </Link>
      ) : (
        <span className={styles.text}>{name}</span>
      )}
      {flag && player.country ? (
        <Flag country={player.country} height={12} label={format.country(player.country)} />
      ) : null}
    </span>
  );
};

export default PlayerName;
