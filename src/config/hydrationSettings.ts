export type HydrationMode = "smart" | "fixed";
export type HydrationSensitivity = "low" | "medium" | "high";

export interface HydrationSettings {
  intervalMinutes: number;
  idleResetMinutes: number;
  enableSound: boolean;
  mode: HydrationMode;
  sensitivity: HydrationSensitivity;
  snoozeMinutes: number;
  suppressInPresentation: boolean;
  tickIntervalSeconds: number;
  analyticsEnabled: boolean;
}

export const DEFAULT_HYDRATION_SETTINGS: HydrationSettings = {
  intervalMinutes: 25,
  idleResetMinutes: 5,
  enableSound: true,
  mode: "smart",
  sensitivity: "medium",
  snoozeMinutes: 15,
  suppressInPresentation: false,
  tickIntervalSeconds: 15,
  analyticsEnabled: true,
};
