import { ImageResponse } from "next/og";

import { imageDataUrl, OG_COLORS, OG_FONTS, OG_SIZE } from "@/features/seo/og/assets";
import { OgAvatar, OgFrame, OgLevel } from "@/features/seo/og/components";
import { getSquad } from "@/features/squad/api/loader";
import { isLocale, LOCALES, DEFAULT_LOCALE } from "@/shared/i18n/locales";
import { getI18n } from "@/shared/i18n/server";

export const size = OG_SIZE;
export const contentType = "image/png";

// One share card per language
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

// Alt text of the share card in the page language
export const generateImageMetadata = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const { t } = await getI18n(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return [{ id: "card", alt: t("og.alt", { app: t("app.name") }), size, contentType }];
};

// Share card with the squad, its average ELO and the top players
const Image = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const [squad, { t, format }] = await Promise.all([getSquad(), getI18n(isLocale(locale) ? locale : DEFAULT_LOCALE)]);
  const players = squad.status === "ready" ? squad.players.toSorted((a, b) => b.elo - a.elo) : [];
  const top = players.slice(0, 5);
  const avatars = await Promise.all(top.map((player) => imageDataUrl(player.avatar)));
  const averageElo = players.length > 0 ? players.reduce((sum, player) => sum + player.elo, 0) / players.length : 0;

  return new ImageResponse(
    <OgFrame kicker={t("og.kicker")} name={t("app.name")}>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 56, gap: 12 }}>
        <span style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>{t("dashboard.title")}</span>
        <span style={{ fontSize: 30, fontWeight: 600, color: OG_COLORS.secondary }}>
          {players.length > 0
            ? t("og.subtitle", {
                players: t("count.players", { count: players.length }),
                elo: format.integer(averageElo),
              })
            : t("og.fallback")}
        </span>
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: "auto" }}>
        {top.map((player, index) => (
          <div
            key={player.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              width: 196,
              padding: "20px 12px",
              borderRadius: 24,
              background: OG_COLORS.surface,
              border: `1px solid ${OG_COLORS.line}`,
            }}
          >
            <OgAvatar src={avatars[index] ?? null} name={player.nickname} size={88} />
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                maxWidth: 172,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {player.nickname}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <OgLevel level={player.level} size={36} />
              <span style={{ fontSize: 24, fontWeight: 800, color: OG_COLORS.secondary }}>
                {format.integer(player.elo)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </OgFrame>,
    { ...size, fonts: OG_FONTS },
  );
};

export default Image;
