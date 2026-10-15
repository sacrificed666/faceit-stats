import type { ReactNode } from "react";

import { levelOf } from "@/features/squad/model/levels";

import { OG_COLORS } from "./assets";

// The logo drawn for share cards and icons
export const OgLogo = ({ size = 44, maskable = false }: { size?: number; maskable?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <defs>
      <linearGradient id="og-fill" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ff9a4d" />
        <stop offset="1" stopColor="#ff4a00" />
      </linearGradient>
      <linearGradient id="og-sheen" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
        <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx={maskable ? 0 : 9} fill="url(#og-fill)" />
    <rect width="32" height="32" rx={maskable ? 0 : 9} fill="url(#og-sheen)" />
    <g fill="#1a0b02" transform={maskable ? "translate(16 16) scale(0.8) translate(-16 -16)" : undefined}>
      <rect x="11.3" y="7.5" width="4.8" height="17" rx="1.2" />
      <rect x="11.3" y="7.5" width="12" height="4.6" rx="1.2" />
      <rect x="11.3" y="14.2" width="9.2" height="4.2" rx="1.2" />
    </g>
  </svg>
);

// The FACEIT level ring for share cards
export const OgLevel = ({ level, size }: { level: number; size: number }) => {
  const { color } = levelOf(level);
  const radius = 9.5;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;
  const filled = (arc * Math.min(Math.max(level, 0), 10)) / 10;
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", top: 0, left: 0 }}>
        <circle cx="12" cy="12" r="12" fill="#1f1f22" />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
          transform="rotate(135 12 12)"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(135 12 12)"
        />
      </svg>
      <span style={{ fontSize: Math.round(size * (level >= 10 ? 0.34 : 0.4)), fontWeight: 800, color }}>{level}</span>
    </div>
  );
};

// An avatar for share cards, with the initial when it is missing
export const OgAvatar = ({ src, name, size }: { src: string | null; name: string; size: number }) => {
  if (src) {
    return (
      <img
        src={src}
        width={size}
        height={size}
        alt=""
        style={{ borderRadius: size, objectFit: "cover", border: `4px solid ${OG_COLORS.surface}` }}
      />
    );
  }
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        borderRadius: size,
        alignItems: "center",
        justifyContent: "center",
        background: OG_COLORS.surface,
        color: OG_COLORS.secondary,
        fontSize: Math.round(size * 0.42),
        fontWeight: 800,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

// The shared frame of every share card: logo, kicker and content
export const OgFrame = ({ children, kicker, name }: { children: ReactNode; kicker: string; name: string }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      padding: "56px 64px",
      background: OG_COLORS.plane,
      backgroundImage: "radial-gradient(900px 420px at 50% -140px, rgba(255, 85, 0, 0.30), rgba(15, 16, 17, 0) 70%)",
      color: OG_COLORS.ink,
      fontFamily: "Montserrat",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <OgLogo />
      <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>{name}</span>
      <span style={{ marginLeft: "auto", fontSize: 22, fontWeight: 600, color: OG_COLORS.muted }}>{kicker}</span>
    </div>
    {children}
  </div>
);
