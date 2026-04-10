import * as vscode from "vscode";
import type { HydrationSettings } from "../config/hydrationSettings";
import type { ActivitySnapshot, TickResult } from "../engine/ReminderEngine";
import { ReminderEngine } from "../engine/ReminderEngine";
import { pickHydrationReminderMessage } from "./hydrationMessages";
import { playSoftSound } from "./playSoftSound";

export class NotificationService implements vscode.Disposable {
  private readonly _status: vscode.StatusBarItem;

  constructor() {
    this._status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this._status.command = "hydration.openSettings";
    this._status.tooltip = "Hydration Assistant — click to open settings";
    this._status.show();
  }

  dispose(): void {
    this._status.dispose();
  }

  updateStatusBar(
    engine: ReminderEngine,
    settings: HydrationSettings,
    snapshot: ActivitySnapshot
  ): void {
    const activeMin = Math.floor(engine.getSessionActiveMs() / 60000);
    const snooze = engine.getSnoozeUntil();
    const now = snapshot.now;

    if (settings.suppressInPresentation) {
      this._status.text = "$(mute) Hydration: off";
      return;
    }

    if (now < snooze) {
      const left = Math.ceil((snooze - now) / 60000);
      this._status.text = `$(watch) Hydration: snoozed ~${left}m`;
      return;
    }

    if (!snapshot.windowFocused) {
      this._status.text = "$(debug-pause) Hydration: paused (unfocused)";
      return;
    }

    this._status.text = `$(beaker) Hydration: ${activeMin}m active`;
  }

  async showHydrationReminder(
    result: Extract<TickResult, { kind: "remind" }>,
    settings: HydrationSettings,
    onSnooze: (minutes: number) => void,
    onDismiss: () => void
  ): Promise<void> {
    const msg = pickHydrationReminderMessage(result.urgency, result.activeMinutesRounded);

    if (settings.enableSound) {
      void playSoftSound();
    }

    const snoozeLabel = `Snooze ${settings.snoozeMinutes}m`;
    const choice = await vscode.window.showInformationMessage(
      msg,
      { modal: false },
      snoozeLabel,
      "Dismiss"
    );

    if (choice === snoozeLabel) {
      onSnooze(settings.snoozeMinutes);
    } else if (choice === "Dismiss") {
      onDismiss();
    }
  }
}
