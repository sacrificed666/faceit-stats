export const EFFECTS = ["auto", "full", "reduced"] as const;

export type Effects = (typeof EFFECTS)[number];

export type EffectsLevel = Exclude<Effects, "auto">;

export const EFFECTS_STORAGE_KEY = "faceit-stats/effects";

export const RICH_EFFECTS_DEVICES = /Mac|iPhone|iPad|iPod/u;

// Whether a value is a valid effects choice
export const isEffects = (value: unknown): value is Effects =>
  typeof value === "string" && (EFFECTS as readonly string[]).includes(value);

// Blur and hover lifts only on Apple devices
export const prefersRichEffects = (userAgent: string): boolean => RICH_EFFECTS_DEVICES.test(userAgent);

// Auto becomes full or reduced, depending on the device
export const resolveEffects = (effects: Effects, rich: boolean): EffectsLevel => {
  if (effects !== "auto") return effects;
  return rich ? "full" : "reduced";
};
