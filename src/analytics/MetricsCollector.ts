import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";

export interface HydrationMetrics {
  version: 1;
  remindersShown: number;
  snoozes: number;
  dismissTaps: number;
  /** Approximate ms spent focused and non-idle (tick-based). */
  activeCodingMsApprox: number;
}

const FILE = "hydration-metrics.json";

export class MetricsCollector implements vscode.Disposable {
  private _data: HydrationMetrics = {
    version: 1,
    remindersShown: 0,
    snoozes: 0,
    dismissTaps: 0,
    activeCodingMsApprox: 0,
  };

  private _flushTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly _ctx: vscode.ExtensionContext) {
    void this._load();
  }

  dispose(): void {
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
    }
    void this._flushNow();
  }

  recordReminderShown(): void {
    this._data.remindersShown += 1;
    this._scheduleFlush();
  }

  recordSnooze(): void {
    this._data.snoozes += 1;
    this._scheduleFlush();
  }

  recordDismiss(): void {
    this._data.dismissTaps += 1;
    this._scheduleFlush();
  }

  addApproxActiveMs(delta: number): void {
    if (delta <= 0) {
      return;
    }
    this._data.activeCodingMsApprox += delta;
    this._scheduleFlush();
  }

  getSnapshot(): Readonly<HydrationMetrics> {
    return { ...this._data };
  }

  private async _load(): Promise<void> {
    const uri = this._fileUri();
    try {
      const raw = await fs.readFile(uri.fsPath, "utf8");
      const parsed = JSON.parse(raw) as Partial<HydrationMetrics>;
      if (parsed?.version === 1) {
        this._data = {
          version: 1,
          remindersShown: parsed.remindersShown ?? 0,
          snoozes: parsed.snoozes ?? 0,
          dismissTaps: parsed.dismissTaps ?? 0,
          activeCodingMsApprox: parsed.activeCodingMsApprox ?? 0,
        };
      }
    } catch {
      // Missing or invalid file; start fresh.
    }
  }

  private _fileUri(): vscode.Uri {
    return vscode.Uri.joinPath(this._ctx.globalStorageUri, FILE);
  }

  private _scheduleFlush(): void {
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
    }
    this._flushTimer = setTimeout(() => {
      void this._flushNow();
    }, 2000);
  }

  private async _flushNow(): Promise<void> {
    const uri = this._fileUri();
    try {
      await fs.mkdir(path.dirname(uri.fsPath), { recursive: true });
      await fs.writeFile(uri.fsPath, JSON.stringify(this._data, null, 2), "utf8");
    } catch {
      // Ignore disk errors for optional local analytics.
    }
  }
}
