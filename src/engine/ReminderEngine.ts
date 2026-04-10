import type { HydrationSensitivity, HydrationSettings } from "../config/hydrationSettings";

/** Rolling-window counts and focus; built by ActivityTracker each tick. */
export interface ActivitySnapshot {
  now: number;
  lastActivityAt: number;
  windowFocused: boolean;
  /** Document change events in the last ~90s (typing intensity). */
  editEventsLast90s: number;
  /** Active editor changes in the last ~30s. */
  fileSwitchesLast30s: number;
  isDebugging: boolean;
  suppressPresentation: boolean;
}

export type TickResult =
  | { kind: "noop" }
  | {
      kind: "remind";
      urgency: "normal" | "high";
      activeMinutesRounded: number;
      effectiveIntervalMinutes: number;
    };

function editHighThreshold(s: HydrationSensitivity): number {
  switch (s) {
    case "low":
      return 14;
    case "medium":
      return 8;
    case "high":
      return 5;
  }
}

function fileSwitchRapidThreshold(s: HydrationSensitivity): number {
  switch (s) {
    case "low":
      return 8;
    case "medium":
      return 5;
    case "high":
      return 3;
  }
}

/**
 * Smart mode adjusts the required continuous active time before a reminder.
 * Fixed mode always uses settings.intervalMinutes.
 */
export function computeEffectiveIntervalMinutes(
  settings: HydrationSettings,
  snapshot: Pick<
    ActivitySnapshot,
    "editEventsLast90s" | "fileSwitchesLast30s" | "isDebugging"
  >
): number {
  const base = settings.intervalMinutes;
  if (settings.mode === "fixed") {
    return base;
  }
  let factor = 1;
  const editTh = editHighThreshold(settings.sensitivity);
  if (snapshot.editEventsLast90s >= editTh) {
    factor *= 0.88;
  }
  const switchTh = fileSwitchRapidThreshold(settings.sensitivity);
  if (snapshot.fileSwitchesLast30s >= switchTh) {
    factor *= 1.14;
  }
  if (snapshot.isDebugging) {
    factor *= 0.92;
  }
  const result = base * factor;
  return Math.max(5, Math.min(120, result));
}

export function activityAppearsIdle(
  settings: HydrationSettings,
  snapshot: Pick<ActivitySnapshot, "now" | "lastActivityAt">
): boolean {
  const idleMs = settings.idleResetMinutes * 60 * 1000;
  return snapshot.now - snapshot.lastActivityAt >= idleMs;
}

/**
 * Event-driven evaluation: call on each tick (e.g. every 15s) with a fresh snapshot.
 * Accumulates focused, non-idle time only; resets on idle or reminder.
 */
export class ReminderEngine {
  private _sessionActiveMs = 0;
  private _lastTickAt: number;
  private _snoozeUntil = 0;

  constructor(private readonly _now: () => number) {
    this._lastTickAt = this._now();
  }

  getSessionActiveMs(): number {
    return this._sessionActiveMs;
  }

  getSnoozeUntil(): number {
    return this._snoozeUntil;
  }

  setSnoozeUntil(utcMs: number): void {
    this._snoozeUntil = utcMs;
    this._lastTickAt = this._now();
  }

  resetSession(): void {
    this._sessionActiveMs = 0;
    this._lastTickAt = this._now();
  }

  tick(settings: HydrationSettings, snapshot: ActivitySnapshot): TickResult {
    if (snapshot.suppressPresentation) {
      this._lastTickAt = snapshot.now;
      return { kind: "noop" };
    }

    if (snapshot.now < this._snoozeUntil) {
      this._lastTickAt = snapshot.now;
      return { kind: "noop" };
    }

    if (activityAppearsIdle(settings, snapshot)) {
      this._sessionActiveMs = 0;
      this._lastTickAt = snapshot.now;
      return { kind: "noop" };
    }

    if (!snapshot.windowFocused) {
      this._lastTickAt = snapshot.now;
      return { kind: "noop" };
    }

    const delta = Math.max(0, snapshot.now - this._lastTickAt);
    this._lastTickAt = snapshot.now;
    this._sessionActiveMs += delta;

    const effectiveMinutes = computeEffectiveIntervalMinutes(settings, snapshot);
    const requiredMs = effectiveMinutes * 60 * 1000;

    if (this._sessionActiveMs < requiredMs) {
      return { kind: "noop" };
    }

    const activeMinutesRounded = Math.max(1, Math.round(this._sessionActiveMs / 60000));
    const urgency: "normal" | "high" =
      settings.mode === "smart" && snapshot.editEventsLast90s >= editHighThreshold(settings.sensitivity)
        ? "high"
        : "normal";

    this._sessionActiveMs = 0;
    return {
      kind: "remind",
      urgency,
      activeMinutesRounded,
      effectiveIntervalMinutes: effectiveMinutes,
    };
  }
}
