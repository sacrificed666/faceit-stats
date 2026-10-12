import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { cacheLife } from "next/cache";

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  plane: "#0f1011",
  surface: "#18191b",
  line: "rgba(255, 255, 255, 0.10)",
  ink: "#f5f5f3",
  secondary: "#c3c2b7",
  muted: "#a09f98",
  accent: "#ff5500",
  accentText: "#ff7a3d",
  good: "#3fbf3f",
  bad: "#f06a6a",
};

const FONT_DIRECTORY = join(process.cwd(), "src/shared/assets/fonts");

const SUBSETS = ["latin", "latin-ext", "cyrillic"] as const;
const WEIGHTS = [600, 800] as const;

export const OG_FONTS = await Promise.all(
  SUBSETS.flatMap((subset) =>
    WEIGHTS.map(async (weight) => ({
      name: "Montserrat",
      data: await readFile(join(FONT_DIRECTORY, `montserrat-${subset}-${weight}.woff`)),
      weight,
      style: "normal" as const,
    })),
  ),
);

// An image as a data URL for a share card, or null when it fails
export const imageDataUrl = async (url: string | null): Promise<string | null> => {
  "use cache";
  cacheLife("days");
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(?:jpeg|png|gif)/.test(type)) return null;
    return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
};
