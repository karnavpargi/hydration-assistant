import * as vscode from "vscode";
import type { ActivitySnapshot } from "../engine/ReminderEngine";

const EDIT_WINDOW_MS = 90_000;
const FILE_SWITCH_WINDOW_MS = 30_000;

function prune(ts: number[], cutoff: number): number[] {
  return ts.filter((t) => t >= cutoff);
}

/**
 * Subscribes to editor, window, and debug events. Call `getActivitySnapshot` on each engine tick.
 */
export class ActivityTracker implements vscode.Disposable {
  private _lastActivityAt = Date.now();
  private _windowFocused = vscode.window.state.focused;
  private readonly _editTimestamps: number[] = [];
  private readonly _fileSwitchTimestamps: number[] = [];
  private _debugSessionDepth = 0;
  private _disposables: vscode.Disposable[] = [];

  constructor() {
    this._disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (!this._isTrackedDocument(e.document)) {
          return;
        }
        this._bumpActivity();
        const now = Date.now();
        this._editTimestamps.push(now);
        this._editTimestamps.splice(0, this._editTimestamps.length - 500);
      }),
      vscode.workspace.onDidSaveTextDocument((doc) => {
        if (!this._isTrackedDocument(doc)) {
          return;
        }
        this._bumpActivity();
        const now = Date.now();
        this._editTimestamps.push(now);
      }),
      vscode.window.onDidChangeWindowState((s) => {
        this._windowFocused = s.focused;
        if (s.focused) {
          this._bumpActivity();
        }
      }),
      vscode.window.onDidChangeActiveTextEditor(() => {
        const now = Date.now();
        this._fileSwitchTimestamps.push(now);
        this._fileSwitchTimestamps.splice(0, this._fileSwitchTimestamps.length - 200);
        this._bumpActivity();
      }),
      vscode.debug.onDidStartDebugSession(() => {
        this._debugSessionDepth += 1;
        this._bumpActivity();
      }),
      vscode.debug.onDidTerminateDebugSession(() => {
        this._debugSessionDepth = Math.max(0, this._debugSessionDepth - 1);
        this._bumpActivity();
      })
    );
  }

  dispose(): void {
    for (const d of this._disposables) {
      d.dispose();
    }
    this._disposables = [];
  }

  getActivitySnapshot(now: number, suppressPresentation: boolean): ActivitySnapshot {
    const editCut = now - EDIT_WINDOW_MS;
    const switchCut = now - FILE_SWITCH_WINDOW_MS;
    const edits = prune(this._editTimestamps, editCut);
    const switches = prune(this._fileSwitchTimestamps, switchCut);
    this._editTimestamps.length = 0;
    this._editTimestamps.push(...edits);
    this._fileSwitchTimestamps.length = 0;
    this._fileSwitchTimestamps.push(...switches);

    return {
      now,
      lastActivityAt: this._lastActivityAt,
      windowFocused: this._windowFocused,
      editEventsLast90s: edits.length,
      fileSwitchesLast30s: switches.length,
      isDebugging: this._debugSessionDepth > 0,
      suppressPresentation,
    };
  }

  private _bumpActivity(): void {
    this._lastActivityAt = Date.now();
  }

  private _isTrackedDocument(doc: vscode.TextDocument): boolean {
    if (doc.isClosed) {
      return false;
    }
    const s = doc.uri.scheme;
    return s === "file" || s === "untitled" || s === "vscode-notebook-cell";
  }
}
