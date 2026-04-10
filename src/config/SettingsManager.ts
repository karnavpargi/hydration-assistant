import * as vscode from "vscode";
import {
  DEFAULT_HYDRATION_SETTINGS,
  type HydrationMode,
  type HydrationSensitivity,
  type HydrationSettings,
} from "./hydrationSettings";

const SECTION = "hydration";

export class SettingsManager {
  private readonly _listeners: Array<(s: HydrationSettings) => void> = [];

  constructor() {
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(SECTION)) {
        this._notify();
      }
    });
  }

  get(): HydrationSettings {
    const c = vscode.workspace.getConfiguration(SECTION);
    return {
      intervalMinutes: c.get<number>("interval", DEFAULT_HYDRATION_SETTINGS.intervalMinutes),
      idleResetMinutes: c.get<number>(
        "idleResetMinutes",
        DEFAULT_HYDRATION_SETTINGS.idleResetMinutes
      ),
      enableSound: c.get<boolean>("enableSound", DEFAULT_HYDRATION_SETTINGS.enableSound),
      mode: c.get<HydrationMode>("mode", DEFAULT_HYDRATION_SETTINGS.mode),
      sensitivity: c.get<HydrationSensitivity>(
        "sensitivity",
        DEFAULT_HYDRATION_SETTINGS.sensitivity
      ),
      snoozeMinutes: c.get<number>("snoozeMinutes", DEFAULT_HYDRATION_SETTINGS.snoozeMinutes),
      suppressInPresentation: c.get<boolean>(
        "suppressInPresentation",
        DEFAULT_HYDRATION_SETTINGS.suppressInPresentation
      ),
      tickIntervalSeconds: c.get<number>(
        "tickIntervalSeconds",
        DEFAULT_HYDRATION_SETTINGS.tickIntervalSeconds
      ),
      analyticsEnabled: c.get<boolean>(
        "analyticsEnabled",
        DEFAULT_HYDRATION_SETTINGS.analyticsEnabled
      ),
    };
  }

  onChange(cb: (s: HydrationSettings) => void): vscode.Disposable {
    this._listeners.push(cb);
    return new vscode.Disposable(() => {
      const i = this._listeners.indexOf(cb);
      if (i >= 0) {
        this._listeners.splice(i, 1);
      }
    });
  }

  private _notify(): void {
    const s = this.get();
    for (const cb of this._listeners) {
      cb(s);
    }
  }

  async openSettings(): Promise<void> {
    await vscode.commands.executeCommand("workbench.action.openSettings", "hydration");
  }
}
