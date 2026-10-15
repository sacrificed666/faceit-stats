"use client";

import { contextFor, type ProfileData } from "@/features/player/model/profile";
import { mapImages } from "@/features/squad/model/maps";
import { viewPlayer } from "@/features/squad/model/squad";
import { useRange } from "@/features/squad/model/useRange";
import { MapImagesProvider } from "@/features/squad/ui/MapThumb/MapThumb";
import RangeToolbar from "@/features/squad/ui/RangeToolbar/RangeToolbar";
import { useI18n } from "@/shared/i18n/useI18n";

import FormSummary from "../FormSummary/FormSummary";
import MatchHistory from "../MatchHistory/MatchHistory";
import PlayerMaps from "../PlayerMaps/PlayerMaps";
import PlayerTrend from "../PlayerTrend/PlayerTrend";
import Playstyle from "../Playstyle/Playstyle";
import SquadLinks from "../SquadLinks/SquadLinks";
import Teammates from "../Teammates/Teammates";

import styles from "./PlayerProfile.module.scss";

interface PlayerProfileProps {
  data: ProfileData;
}

// The sections of a player page for the range in the address
const PlayerProfile = ({ data }: PlayerProfileProps) => {
  const { t } = useI18n();
  const range = useRange();
  const context = contextFor(data, range);
  if (!context) return null;
  const view = viewPlayer(data.player, range, data.updatedAt);
  const squad = new Map(data.squad.map((mate) => [mate.id, mate]));
  const sections = [
    { id: "form", label: t("section.form") },
    { id: "trend", label: t("section.trend") },
    { id: "maps", label: t("section.maps") },
    { id: "matches", label: t("section.history") },
    { id: "teammates", label: t("section.teammates") },
    { id: "lifetime", label: t("section.lifetime") },
  ];

  return (
    <MapImagesProvider images={mapImages([data.player])}>
      <div className={styles.profile} data-query-scope="">
        <RangeToolbar sections={sections} />
        <FormSummary view={view} averages={context.averages} />
        <PlayerTrend view={view} averages={context.averages} />
        <PlayerMaps view={view} />
        <MatchHistory view={view} squad={squad} mates={new Map(context.mates)} />
        <Teammates view={view} squad={squad} mates={context.teammates} />
        <Playstyle player={data.player} />
        <SquadLinks squad={data.squad} current={data.player.id} />
      </div>
    </MapImagesProvider>
  );
};

export default PlayerProfile;
