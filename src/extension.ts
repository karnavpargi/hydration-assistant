import * as vscode from "vscode";
import { ActivityTracker } from "./activity/ActivityTracker";
import { MetricsCollector } from "./analytics/MetricsCollector";
import { SettingsManager } from "./config/SettingsManager";
import { activityAppearsIdle, ReminderEngine } from "./engine/ReminderEngine";
import { NotificationService } from "./ui/NotificationService";

export function activate(context: vscode.ExtensionContext): void {
  const settingsManager = new SettingsManager();
  const activityTracker = new ActivityTracker();
  const engine = new ReminderEngine(() => Date.now());
  const metrics = new MetricsCollector(context);
  const notifications = new NotificationService();

  let timer: ReturnType<typeof setInterval> | undefined;

  const clearTimer = (): void => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  const runTick = (): void => {
    const settings = settingsManager.get();
    const now = Date.now();
    const snapshot = activityTracker.getActivitySnapshot(now, settings.suppressInPresentation);

    if (settings.analyticsEnabled) {
      const idle = activityAppearsIdle(settings, snapshot);
      if (snapshot.windowFocused && !idle) {
        metrics.addApproxActiveMs(settings.tickIntervalSeconds * 1000);
      }
    }

    const result = engine.tick(settings, snapshot);
    notifications.updateStatusBar(engine, settings, snapshot);

    if (result.kind === "remind") {
      if (settings.analyticsEnabled) {
        metrics.recordReminderShown();
      }
      void notifications.showHydrationReminder(
        result,
        settings,
        (minutes) => {
          const until = Date.now() + minutes * 60 * 1000;
          engine.setSnoozeUntil(until);
          if (settingsManager.get().analyticsEnabled) {
            metrics.recordSnooze();
          }
        },
        () => {
          if (settingsManager.get().analyticsEnabled) {
            metrics.recordDismiss();
          }
        }
      );
    }
  };

  const scheduleTimer = (): void => {
    clearTimer();
    const s = settingsManager.get();
    const ms = Math.max(5, s.tickIntervalSeconds) * 1000;
    timer = setInterval(runTick, ms);
  };

  context.subscriptions.push(
    { dispose: clearTimer },
    settingsManager.onChange(() => {
      scheduleTimer();
    }),
    activityTracker,
    notifications,
    metrics,
    vscode.commands.registerCommand("hydration.snooze", () => {
      const s = settingsManager.get();
      const until = Date.now() + s.snoozeMinutes * 60 * 1000;
      engine.setSnoozeUntil(until);
      if (s.analyticsEnabled) {
        metrics.recordSnooze();
      }
      runTick();
    }),
    vscode.commands.registerCommand("hydration.resetSession", () => {
      engine.resetSession();
      runTick();
    }),
    vscode.commands.registerCommand("hydration.togglePresentation", async () => {
      const c = vscode.workspace.getConfiguration("hydration");
      const cur = c.get<boolean>("suppressInPresentation") ?? false;
      await c.update("suppressInPresentation", !cur, vscode.ConfigurationTarget.Global);
      runTick();
    }),
    vscode.commands.registerCommand("hydration.openSettings", () => settingsManager.openSettings())
  );

  scheduleTimer();
  runTick();
}

export function deactivate(): void {
  // Disposables owned by context.subscriptions are disposed by VS Code.
}
