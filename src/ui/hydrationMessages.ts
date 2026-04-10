/** Random reminder copy; `{m}` is replaced with active minutes. */

type MsgFn = (m: number) => string;

const NORMAL_MESSAGES: readonly MsgFn[] = [
  (m) =>
    `💧 ~${m} min deep in the editor. Your AI can ship snippets—it can't ship water to your cells. Sip.`,
  (m) => `💧 You've been at it ~${m} min. Commit to a sip before the next commit.`,
  (m) => `💧 ~${m} minutes of flow. Water is your zero-downtime deploy for your body.`,
  (m) => `💧 ~${m} min coding streak. Refactor your thirst—sip now.`,
  (m) => `💧 Brain compile running hot? ~${m} min in. Cool it with water.`,
  (m) => `💧 ~${m} min of solid focus. Merge this glass into main (your body).`,
  (m) => `💧 Thirsty tabs, thirsty you? ~${m} min on the clock—drink up.`,
  (m) => `💧 ~${m} min in the matrix. The hydration API is calling—200 OK?`,
  (m) => `💧 You've shipped thoughts for ~${m} min. Ship some H₂O to production.`,
  (m) => `💧 ~${m} min uninterrupted. Your keyboard got love; your cells want some too.`,
  (m) => `💧 Debugger still paused? Your water break isn't. ~${m} min in—sip.`,
  (m) => `💧 ~${m} min of productive typing. Rehydrate—you're not a camel, you're a dev.`,
  (m) => `💧 Git won't blame dehydration if you sip now. ~${m} min on the clock.`,
  (m) => `💧 ~${m} min in flow state. Add liquidity to the system—literally.`,
];

const HIGH_MESSAGES: readonly MsgFn[] = [
  (m) => `⚡ Turbo mode ~${m} min: your fingers are benching PRs—hydrate the engine.`,
  (m) => `⚡ Rapid-fire edits for ~${m} min. You're not a heat sink; drink water.`,
  (m) => `⚡ High RPM coding (~${m} min). Coolant low—add water before thermal throttle.`,
  (m) => `⚡ Sprinting in place for ~${m} min. Even CI runners need coolant.`,
  (m) => `⚡ Keyboard smoke detected (~${m} min intensity). Extinguish with a sip.`,
  (m) => `⚡ ~${m} min of peak output. Your CPU has fans; you have a bottle.`,
  (m) => `⚡ Crushing it for ~${m} min straight. Don't let thirst be the silent bug.`,
  (m) => `⚡ Edit storm: ~${m} min. Refill the tank—thirst isn't a feature.`,
  (m) => `⚡ You're on fire (figuratively). ~${m} min—add literal water.`,
  (m) => `⚡ Throughput maxed for ~${m} min. Bottleneck alert: your water level.`,
  (m) => `⚡ Blazing through code for ~${m} min. Splash zone: your water bottle.`,
  (m) => `⚡ Intensity for ~${m} min: legendary. Hydration still pending—approve?`,
  (m) => `⚡ ~${m} min of click-clack excellence. Sip now; future you sends thanks.`,
  (m) => `⚡ Redline ~${m} min. Pit stop: bottle, not breakpoint.`,
  (m) => `⚡ ~${m} min nonstop. Your backlog is clear; your glass shouldn't be empty.`,
  (m) => `⚡ Machine-gun commits (~${m} min). Reload your fluids before the next burst.`,
];

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function pickHydrationReminderMessage(
  urgency: "normal" | "high",
  activeMinutesRounded: number
): string {
  const pool = urgency === "high" ? HIGH_MESSAGES : NORMAL_MESSAGES;
  return pickRandom(pool)(activeMinutesRounded);
}
