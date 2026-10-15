"use client";

import { mapName } from "@/features/squad/model/maps";
import { mapCells, type PlayerView } from "@/features/squad/model/squad";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import { useI18n } from "@/shared/i18n/useI18n";
import { fitGrid } from "@/shared/lib/fitGrid";
import BackdropImage from "@/shared/ui/BackdropImage/BackdropImage";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import Section from "@/shared/ui/Section/Section";

import styles from "./PlayerMaps.module.scss";

interface PlayerMapsProps {
  view: PlayerView;
}

// A card for every map played in the range, next to the all-time numbers
const PlayerMaps = ({ view }: PlayerMapsProps) => {
  const { t, format } = useI18n();
  const cells = [...mapCells(view).entries()].toSorted(
    ([aMap, a], [bMap, b]) => b.matches - a.matches || mapName(aMap).localeCompare(mapName(bMap)),
  );
  const segments = new Map(view.player.maps.map((segment) => [segment.map, segment]));
  const columns = [t("metric.matches"), t("metric.winRate"), t("metric.kd"), t("metric.adr")];
  const grid = fitGrid(cells.length, { sm: [2], lg: [3, 4], xl: [4] });

  return (
    <Section id="maps" title={t("playerMaps.title")} description={t("playerMaps.description")}>
      {cells.length === 0 ? (
        <div className={styles.panel}>
          <EmptyState icon="map" title={t("empty.range")} />
        </div>
      ) : (
        <ul className={styles.grid} style={grid.list}>
          {cells.map(([map, summary], index) => {
            const segment = segments.get(map);
            return (
              <li key={map} className={styles.card} style={grid.item(index)}>
                <div className={styles.cover}>
                  <BackdropImage
                    src={segment?.image ?? null}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={styles.image}
                  />
                  <div aria-hidden="true" className={styles.fade} />
                  <h3 className={styles.title}>{mapName(map)}</h3>
                </div>
                <table className={styles.table}>
                  <caption className="visually-hidden">{t("playerMaps.caption", { map: mapName(map) })}</caption>
                  <thead>
                    <tr className={styles.columns}>
                      <td aria-hidden="true" className={styles.gutter} />
                      {columns.map((column) => (
                        <th key={column} scope="col" className={styles.column}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={styles.range}>
                      <th scope="row" className={styles.label}>
                        {t("playerMaps.range")}
                      </th>
                      <td className={styles.value}>{format.integer(summary.matches)}</td>
                      <td className={styles.value}>
                        <MetricValue metric="winRate" value={summary.winRate} digits={0} />
                      </td>
                      <td className={styles.value}>
                        <MetricValue metric="kd" value={summary.kd} />
                      </td>
                      <td className={styles.value}>
                        <MetricValue metric="adr" value={summary.adr} />
                      </td>
                    </tr>
                    <tr className={styles.allTime}>
                      <th scope="row" className={styles.label}>
                        {t("playerMaps.allTime")}
                      </th>
                      <td className={styles.value}>{segment ? format.integer(segment.matches) : "-"}</td>
                      <td className={styles.value}>{segment ? format.percent(segment.winRate, 0) : "-"}</td>
                      <td className={styles.value}>{segment ? format.decimal(segment.kd, 2) : "-"}</td>
                      <td className={styles.value}>
                        {segment?.adr === null || segment?.adr === undefined ? "-" : format.decimal(segment.adr, 1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
};

export default PlayerMaps;
