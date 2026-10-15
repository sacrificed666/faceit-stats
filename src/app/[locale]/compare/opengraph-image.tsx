import { ImageResponse } from "next/og";

import { imageDataUrl, OG_COLORS, OG_FONTS, OG_SIZE } from "@/features/seo/og/assets";
import { OgAvatar, OgFrame, OgLevel } from "@/features/seo/og/components";
import { getSquad } from "@/features/squad/api/loader";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/shared/i18n/locales";
import { getI18n } from "@/shared/i18n/server";

export const size = OG_SIZE;
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ locale: string }>;
}

// One share card per language
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

// Alt text of the share card in the page language
export const generateImageMetadata = async ({ params }: ImageProps) => {
  const { locale } = await params;
  const { t } = await getI18n(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return [{ id: "card", alt: t("og.compareAlt"), size, contentType }];
};

// Share card with the two highest rated players face to face
const Image = async ({ params }: ImageProps) => {
  const { locale } = await params;
  const [squad, { t, format }] = await Promise.all([getSquad(), getI18n(isLocale(locale) ? locale : DEFAULT_LOCALE)]);
  const [first, second] = squad.status === "ready" ? squad.players.toSorted((a, b) => b.elo - a.elo) : [];
  const contenders = [first, second].filter((player) => player !== undefined);
  const avatars = await Promise.all(contenders.map((player) => imageDataUrl(player.avatar)));

  return new ImageResponse(
    <OgFrame kicker={t("og.kicker")} name={t("app.name")}>
      <span style={{ marginTop: 48, fontSize: 84, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>
        {t("compare.title")}
      </span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, marginTop: "auto" }}>
        {contenders.map((player, index) => (
          <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 48 }}>
            {index === 1 ? (
              <div
                style={{
                  display: "flex",
                  width: 96,
                  height: 96,
                  borderRadius: 96,
                  alignItems: "center",
                  justifyContent: "center",
                  background: OG_COLORS.accent,
                  color: "#111110",
                  fontSize: 36,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {t("compare.vs")}
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 320 }}>
              <OgAvatar src={avatars[index] ?? null} name={player.nickname} size={140} />
              <span
                style={{ fontSize: 40, fontWeight: 800, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {player.nickname}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <OgLevel level={player.level} size={44} />
                <span style={{ fontSize: 32, fontWeight: 800, color: OG_COLORS.secondary }}>
                  {format.integer(player.elo)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </OgFrame>,
    { ...size, fonts: OG_FONTS },
  );
};

export default Image;
