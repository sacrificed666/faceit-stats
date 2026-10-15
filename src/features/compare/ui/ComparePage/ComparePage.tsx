"use client";

import { pickPair, rivalry, sharedMatches } from "@/features/compare/model/compare";
import { viewPlayer } from "@/features/squad/model/squad";
import type { Player } from "@/features/squad/model/types";
import { useRange } from "@/features/squad/model/useRange";
import { MapImagesProvider } from "@/features/squad/ui/MapThumb/MapThumb";
import RangeToolbar from "@/features/squad/ui/RangeToolbar/RangeToolbar";
import { setSearchParams, useSearchParam } from "@/shared/hooks/useQuery";
import { useI18n } from "@/shared/i18n/useI18n";
import { cx } from "@/shared/lib/cx";
import IconButton from "@/shared/ui/IconButton/IconButton";
import Section from "@/shared/ui/Section/Section";

import CompareRows from "../CompareRows/CompareRows";
import Contender from "../Contender/Contender";
import PlayerPicker from "../PlayerPicker/PlayerPicker";
import SharedMatches from "../SharedMatches/SharedMatches";
import { formRows, lifetimeRows, mapRows } from "./rows";

import styles from "./ComparePage.module.scss";

interface ComparePageProps {
  players: Player[];
  updatedAt: number;
  mapImages: Readonly<Record<string, string>>;
}

// Two players side by side, picked in the address so the page can be shared
const ComparePage = ({ players, updatedAt, mapImages }: ComparePageProps) => {
  const { t, format } = useI18n();
  const range = useRange();
  const ordered = players.toSorted((a, b) => b.elo - a.elo);
  const nicknames = ordered.map((player) => player.nickname);
  const pair = pickPair(nicknames, useSearchParam("a"), useSearchParam("b"));
  const first = ordered.find((player) => player.nickname === pair?.[0]);
  const second = ordered.find((player) => player.nickname === pair?.[1]);

  const sections = [
    { id: "stats", label: t("section.stats") },
    { id: "lifetime", label: t("section.lifetime") },
    { id: "maps", label: t("section.maps") },
    { id: "shared", label: t("section.shared") },
  ];

  // The table header with both players
  const header = (
    <header className={styles.header}>
      <p className={styles.kicker}>{t("app.kicker")}</p>
      <h1 className={styles.title}>{t("compare.title")}</h1>
      <p className={styles.lead}>{t("compare.description")}</p>
    </header>
  );

  if (!first || !second) {
    return (
      <div className={styles.needTwo}>
        {header}
        <p className={styles.message}>{t("compare.needTwo")}</p>
      </div>
    );
  }

  const a = viewPlayer(first, range, updatedAt);
  const b = viewPlayer(second, range, updatedAt);
  const shared = sharedMatches(a.matches, b.matches);
  const rival = rivalry(shared);

  // Picks a player; picking the other side's player swaps the two
  const choose = (slot: "a" | "b", nickname: string): void => {
    const taken = slot === "a" ? second.nickname : first.nickname;
    if (nickname !== taken) {
      setSearchParams({ [slot]: nickname });
      return;
    }
    setSearchParams(slot === "a" ? { a: nickname, b: first.nickname } : { a: second.nickname, b: nickname });
  };

  return (
    <MapImagesProvider images={mapImages}>
      <div className={styles.page} data-query-scope="">
        {header}
        <RangeToolbar sections={sections} />

        <section aria-label={t("compare.pick")} className={styles.pick}>
          <div className={styles.pickers}>
            <PlayerPicker
              label={t("compare.first")}
              value={first.nickname}
              players={ordered}
              onChange={(value) => choose("a", value)}
            />
            <IconButton
              icon="swap"
              label={t("compare.swap")}
              variant="outline"
              iconClassName={styles.swapIcon}
              onClick={() => setSearchParams({ a: second.nickname, b: first.nickname })}
              className={styles.swap}
            />
            <PlayerPicker
              label={t("compare.second")}
              value={second.nickname}
              players={ordered}
              onChange={(value) => choose("b", value)}
            />
          </div>
          <div className={styles.versus}>
            <Contender view={a} align="start" />
            <span aria-hidden="true" className={styles.vs}>
              {t("compare.vs")}
            </span>
            <Contender view={b} align="end" />
          </div>
          <dl className={styles.record}>
            <div className={styles.fact}>
              <dt className={styles.factLabel}>{t("compare.together")}</dt>
              <dd className={styles.factValue}>
                {rival.together.matches > 0
                  ? t("compare.togetherSummary", {
                      count: rival.together.matches,
                      record: `${rival.together.wins}-${rival.together.matches - rival.together.wins}`,
                    })
                  : t("compare.never")}
              </dd>
            </div>
            <div className={cx(styles.fact, styles.factEnd)}>
              <dt className={styles.factLabel}>{t("compare.against")}</dt>
              <dd className={styles.factValue}>
                {rival.against.matches > 0
                  ? t("compare.againstSummary", {
                      first: first.nickname,
                      firstWins: rival.against.firstWins,
                      second: second.nickname,
                      secondWins: rival.against.secondWins,
                    })
                  : t("compare.never")}
              </dd>
            </div>
          </dl>
        </section>

        <div className={styles.tables}>
          <Section id="stats" title={t("compare.stats")} description={t("compare.statsDescription")}>
            <CompareRows
              caption={t("compare.stats")}
              firstName={first.nickname}
              secondName={second.nickname}
              rows={formRows(a, b, t, format)}
            />
          </Section>

          <Section id="lifetime" title={t("compare.lifetime")} description={t("compare.lifetimeDescription")}>
            <CompareRows
              caption={t("compare.lifetime")}
              firstName={first.nickname}
              secondName={second.nickname}
              rows={lifetimeRows(first, second, t, format)}
            />
          </Section>
        </div>

        <Section id="maps" title={t("compare.mapsTitle")} description={t("compare.mapsDescription")}>
          <CompareRows
            caption={t("compare.mapsCaption", { first: first.nickname, second: second.nickname })}
            firstName={first.nickname}
            secondName={second.nickname}
            rows={mapRows(a, b, t, format)}
          />
        </Section>

        <SharedMatches shared={shared} firstName={first.nickname} secondName={second.nickname} />
      </div>
    </MapImagesProvider>
  );
};

export default ComparePage;
