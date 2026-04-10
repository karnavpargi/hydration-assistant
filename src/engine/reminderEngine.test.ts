import assert from "assert";
import { describe, it } from "mocha";
import type { HydrationSettings } from "../config/hydrationSettings";
import {
  ActivitySnapshot,
  ReminderEngine,
  computeEffectiveIntervalMinutes,
} from "./ReminderEngine";

const baseSettings = (): HydrationSettings => ({
  intervalMinutes: 25,
  idleResetMinutes: 5,
  enableSound: false,
  mode: "smart",
  sensitivity: "medium",
  snoozeMinutes: 15,
  suppressInPresentation: false,
  tickIntervalSeconds: 15,
  analyticsEnabled: true,
});

function snap(over: Partial<ActivitySnapshot> & { now: number }): ActivitySnapshot {
  return {
    now: over.now,
    lastActivityAt: over.lastActivityAt ?? over.now,
    windowFocused: over.windowFocused ?? true,
    editEventsLast90s: over.editEventsLast90s ?? 0,
    fileSwitchesLast30s: over.fileSwitchesLast30s ?? 0,
    isDebugging: over.isDebugging ?? false,
    suppressPresentation: over.suppressPresentation ?? false,
  };
}

describe("computeEffectiveIntervalMinutes", () => {
  it("returns base interval in fixed mode", () => {
    const s = { ...baseSettings(), mode: "fixed" as const, intervalMinutes: 30 };
    const v = computeEffectiveIntervalMinutes(s, {
      editEventsLast90s: 100,
      fileSwitchesLast30s: 100,
      isDebugging: true,
    });
    assert.strictEqual(v, 30);
  });

  it("reduces interval when edit intensity is high in smart mode", () => {
    const s = { ...baseSettings(), mode: "smart" as const, intervalMinutes: 25 };
    const lowEdits = computeEffectiveIntervalMinutes(s, {
      editEventsLast90s: 0,
      fileSwitchesLast30s: 0,
      isDebugging: false,
    });
    const highEdits = computeEffectiveIntervalMinutes(s, {
      editEventsLast90s: 20,
      fileSwitchesLast30s: 0,
      isDebugging: false,
    });
    assert.ok(highEdits < lowEdits);
  });

  it("increases interval when file switching is rapid in smart mode", () => {
    const s = { ...baseSettings(), mode: "smart" as const, intervalMinutes: 25 };
    const calm = computeEffectiveIntervalMinutes(s, {
      editEventsLast90s: 0,
      fileSwitchesLast30s: 0,
      isDebugging: false,
    });
    const rapid = computeEffectiveIntervalMinutes(s, {
      editEventsLast90s: 0,
      fileSwitchesLast30s: 10,
      isDebugging: false,
    });
    assert.ok(rapid > calm);
  });
});

describe("ReminderEngine", () => {
  it("does not accumulate when window is unfocused", () => {
    let t = 1_000_000;
    const now = () => t;
    const eng = new ReminderEngine(now);
    const settings = baseSettings();
    eng.tick(settings, snap({ now: t, lastActivityAt: t, windowFocused: false }));
    t += 60_000;
    eng.tick(settings, snap({ now: t, lastActivityAt: t, windowFocused: false }));
    assert.strictEqual(eng.getSessionActiveMs(), 0);
  });

  it("resets session when idle beyond threshold", () => {
    let t = 1_000_000;
    const now = () => t;
    const eng = new ReminderEngine(now);
    const settings = baseSettings();
    eng.tick(settings, snap({ now: t, lastActivityAt: t, windowFocused: true }));
    t += 60_000;
    eng.tick(settings, snap({ now: t, lastActivityAt: t, windowFocused: true }));
    assert.ok(eng.getSessionActiveMs() > 0);
    const idleAt = t - 6 * 60_000;
    eng.tick(settings, snap({ now: t, lastActivityAt: idleAt, windowFocused: true }));
    assert.strictEqual(eng.getSessionActiveMs(), 0);
  });

  it("fires remind after required active ms when focused", () => {
    let t = 0;
    const now = () => t;
    const eng = new ReminderEngine(now);
    const settings = { ...baseSettings(), intervalMinutes: 5 };
    let result: ReturnType<ReminderEngine["tick"]> = { kind: "noop" };
    for (let i = 0; i < 8; i++) {
      t += 61_000;
      result = eng.tick(
        settings,
        snap({ now: t, lastActivityAt: t, windowFocused: true, editEventsLast90s: 0 })
      );
      if (result.kind === "remind") {
        break;
      }
    }
    assert.strictEqual(result.kind, "remind");
    if (result.kind === "remind") {
      assert.ok(result.activeMinutesRounded >= 1);
    }
  });

  it("respects snooze", () => {
    const t = 1_000_000;
    const now = () => t;
    const eng = new ReminderEngine(now);
    const settings = baseSettings();
    eng.setSnoozeUntil(t + 60_000);
    const r = eng.tick(settings, snap({ now: t, lastActivityAt: t, windowFocused: true }));
    assert.strictEqual(r.kind, "noop");
  });
});
