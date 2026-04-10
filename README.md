# Hydration Assistant

**Repository:** [github.com/karnavpargi/hydration-assistant](https://github.com/karnavpargi/hydration-assistant) · **Author:** Karnav Pargi

Context-aware hydration reminders for Visual Studio Code. Reminders follow **focused coding time** (not a blind wall-clock timer): continuous activity builds toward a reminder; going idle or switching away pauses or resets the cycle.

## Features (MVP)

- **Activity-based timing**: tracks typing, saves, debug sessions, and window focus.
- **Smart mode**: adjusts the effective interval using recent edit intensity, rapid file switching, and debugging (see settings).
- **Non-intrusive UI**: status bar summary and optional short sound; reminders use the standard information message (not modal).
- **Local-only metrics**: optional counters and approximate active time stored under the extension global storage path. Nothing is sent over the network.

## Commands

| Command | Action |
|--------|--------|
| **Hydration: Snooze reminders** | Pauses reminders for `hydration.snoozeMinutes`. |
| **Hydration: Reset session timer** | Clears accumulated focused time for the current cycle. |
| **Hydration: Toggle presentation mode** | Flips `hydration.suppressInPresentation` (useful before demos). |
| **Hydration: Open settings** | Opens Settings filtered to `hydration` keys. |

## Settings

| ID | Default | Description |
|----|---------|-------------|
| `hydration.interval` | `25` | Minutes of continuous **focused, non-idle** activity before a reminder. |
| `hydration.idleResetMinutes` | `5` | Minutes without activity before the work session resets. |
| `hydration.enableSound` | `false` | Plays a short system sound when a reminder appears (best-effort per OS). |
| `hydration.mode` | `smart` | `smart`: adapt using activity signals; `fixed`: use `interval` only. |
| `hydration.sensitivity` | `medium` | How strongly rapid edits and file switching affect smart timing. |
| `hydration.snoozeMinutes` | `15` | Default snooze length from the toast or the Snooze command. |
| `hydration.suppressInPresentation` | `false` | When `true`, no reminders are shown. |
| `hydration.tickIntervalSeconds` | `15` | How often the extension evaluates state (seconds). |
| `hydration.analyticsEnabled` | `true` | When `true`, writes local metrics JSON only (see privacy). |

## Privacy

- No accounts, telemetry, or remote APIs.
- If `hydration.analyticsEnabled` is enabled, the extension writes a small JSON file under its **global storage** directory (see **Developer: Open Extension Storage Folder** in the Command Palette, then the folder for this extension). You can disable analytics anytime.

## Development

```bash
npm install
npm run compile
npm test
```

Press **F5** in this folder to launch an Extension Development Host with the extension loaded.

## Packaging

Set `publisher` in `package.json` to your Marketplace publisher id, then:

```bash
npm install -g @vscode/vsce
vsce package
```

## License

MIT — see [LICENSE](LICENSE).
