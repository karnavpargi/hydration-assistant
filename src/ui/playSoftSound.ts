import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Short, non-blocking system sound. Fails silently if the OS cannot play it.
 */
export async function playSoftSound(): Promise<void> {
  try {
    if (process.platform === "win32") {
      await execFileAsync("powershell", [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "[console]::Beep(880,140)",
      ]);
    } else if (process.platform === "darwin") {
      await execFileAsync("afplay", ["/System/Library/Sounds/Glass.aiff"]);
    } else {
      await execFileAsync("paplay", ["/usr/share/sounds/freedesktop/stereo/message.oga"], {
        windowsHide: true,
      });
    }
  } catch {
    // Best-effort; no user-facing error for optional chime.
  }
}
