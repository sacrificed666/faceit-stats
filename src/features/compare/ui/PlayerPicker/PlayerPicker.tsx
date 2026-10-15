"use client";

import { useId } from "react";

import type { Player } from "@/features/squad/model/types";
import { useI18n } from "@/shared/i18n/useI18n";
import Avatar from "@/shared/ui/Avatar/Avatar";
import Select from "@/shared/ui/Select/Select";

import styles from "./PlayerPicker.module.scss";

interface PlayerPickerProps {
  label: string;
  value: string;
  players: readonly Player[];
  onChange: (nickname: string) => void;
}

// A labelled select for one of the two players, with their avatar and ELO
const PlayerPicker = ({ label, value, players, onChange }: PlayerPickerProps) => {
  const id = useId();
  const { format } = useI18n();
  const selected = players.find((player) => player.nickname === value);
  return (
    <div className={styles.picker}>
      <label htmlFor={id} className={styles.pickerLabel}>
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        leading={<Avatar src={selected?.avatar ?? null} name={value} size={26} />}
      >
        {players.map((player) => (
          <option key={player.id} value={player.nickname}>
            {`${player.nickname} · ${format.integer(player.elo)}`}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default PlayerPicker;
