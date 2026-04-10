## Learned User Preferences

- Use the npm or Marketplace package name `hydration-assistant`, not `developer-hydration-assistant`.
- When writing or revising hydration reminder copy, align tone with how developers work today (including AI-assisted workflows); skip dated references when a fresher line fits better.
- Reminder text uses many rotating messages in `src/ui/hydrationMessages.ts`, chosen at random by urgency (`normal` vs `high`).

## Learned Workspace Facts

- This workspace is the VS Code extension **Hydration Assistant**: activity-based reminders, local-only optional metrics, settings under the `hydration` configuration namespace.
- Canonical source repo: https://github.com/karnavpargi/hydration-assistant. Author: Karnav Pargi (see `package.json`, `README.md`, `LICENSE`). VS Marketplace publisher id: `karnav` (`package.json` `publisher`).
- Build pipeline: TypeScript compiled with esbuild to `dist/extension.js`; unit tests run with Mocha (`npm test`).
