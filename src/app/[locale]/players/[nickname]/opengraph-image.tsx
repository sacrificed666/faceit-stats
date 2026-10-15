import { ImageResponse } from "next/og";

import { imageDataUrl, OG_COLORS, OG_FONTS, OG_SIZE } from "@/features/seo/og/assets";
import { OgAvatar, OgFrame, OgLevel } from "@/features/seo/og/components";
import { getSquad, squadNicknames } from "@/features/squad/api/loader";
import { findPlayer } from "@/features/squad/model/players";
import { DEFAULT_RANGE, selectMatches } from "@/features/squad/model/range";
import { summarize } from "@/features/squad/model/stats";
import { DEFAULT_LOCALE, isLocale } from "@/shared/i18n/locales";
import { getI18n } from "@/shared/i18n/server";

export const size = OG_SIZE;
export const contentType = "image/png";

// One share card per language and player
export const generateStaticParams = async () => {
  const nicknames = await squadNicknames();
  return nicknames.length > 0 ? nicknames.map((nickname) => ({ nickname })) : [{ nickname: "__squad__" }];
};

interface ImageProps {
  params: Promise<{ locale: string; nickname: string }>;
}

// Alt text of the share card in the page language
export const generateImageMetadata = async ({ params }: ImageProps) => {
  const { locale } = await params;
  const { t } = await getI18n(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return [{ id: "card", alt: t("og.playerAlt"), size, contentType }];
};

// Share card with the player's avatar, level, ELO and recent numbers
const Image = async ({ params }: ImageProps) => {
  const { locale, nickname } = await params;
  const [squad, { t, format }] = await Promise.all([getSquad(), getI18n(isLocale(locale) ? locale : DEFAULT_LOCALE)]);
  const player = squad.status === "ready" ? findPlayer(squad.players, nickname) : null;
  const name = t("app.name");

  if (!player) {
    return new ImageResponse(
      <OgFrame kicker="Counter-Strike 2" name={name}>
        <span style={{ marginTop: 120, fontSize: 88, fontWeight: 800 }}>{t("player.notFound")}</span>
      </OgFrame>,
      { ...size, fonts: OG_FONTS },
    );
  }

  const avatar = await imageDataUrl(player.avatar);
  const recent = selectMatches(player.matches, DEFAULT_RANGE, squad.status === "ready" ? squad.updatedAt : 0);
  const summary = summarize(recent);
  const stats = [
    { label: t("metric.kd"), value: format.decimal(summary.kd, 2) },
    { label: t("metric.adr"), value: format.decimal(summary.adr, 1) },
    { label: t("metric.hsPercent"), value: format.percent(summary.hsPercent, 0) },
    { label: t("metric.winRate"), value: format.percent(summary.winRate, 0) },
  ];

  return new ImageResponse(
    <OgFrame kicker={player.region ? `Counter-Strike 2 · ${player.region}` : "Counter-Strike 2"} name={name}>
      <div style={{ display: "flex", alignItems: "center", gap: 48, marginTop: 48 }}>
        <OgAvatar src={avatar} name={player.nickname} size={220} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
          <span
            style={{
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1,
              maxWidth: 760,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {player.nickname}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <OgLevel level={player.level} size={64} />
            <span style={{ fontSize: 48, fontWeight: 800 }}>{format.integer(player.elo)}</span>
            <span style={{ fontSize: 28, fontWeight: 600, color: OG_COLORS.muted }}>{t("metric.elo")}</span>
            {player.regionRank && player.region ? (
              <span style={{ fontSize: 26, fontWeight: 600, color: OG_COLORS.secondary, marginLeft: 12 }}>
                {t("roster.regionRank", { rank: format.integer(player.regionRank), region: player.region })}
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {recent.slice(0, 10).map((match) => (
              <div
                key={match.id}
                style={{
                  display: "flex",
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  color: match.won ? OG_COLORS.good : OG_COLORS.bad,
                  background: match.won ? "rgba(12, 163, 12, 0.18)" : "rgba(208, 59, 59, 0.20)",
                }}
              >
                {t(match.won ? "result.winShort" : "result.lossShort")}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: "auto" }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 4,
              padding: "18px 24px",
              borderRadius: 22,
              background: OG_COLORS.surface,
              border: `1px solid ${OG_COLORS.line}`,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 600, color: OG_COLORS.muted }}>{stat.label}</span>
            <span style={{ fontSize: 44, fontWeight: 800 }}>{stat.value}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 4,
            paddingLeft: 8,
            fontSize: 20,
            fontWeight: 600,
            color: OG_COLORS.muted,
          }}
        >
          <span>{t("og.lastMatches", { count: summary.matches })}</span>
          <span>{t("og.record", { wins: summary.wins, losses: summary.losses })}</span>
        </div>
      </div>
    </OgFrame>,
    { ...size, fonts: OG_FONTS },
  );
};

export default Image;
