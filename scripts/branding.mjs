/**
 * Single source of truth: media/logo-readme.png (master artwork).
 * icon-128.png MUST be byte-identical to Sharp resize from that PNG — no other code path.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.join(__dirname, "..");
/** Hand-edited logo; README and Marketplace hero use this file. */
export const logoReadmePath = path.join(projectRoot, "media", "logo-readme.png");

export const ICON_OUTPUT = {
  key: "icon-128",
  file: "media/icon-128.png",
};

/**
 * Expected bytes for the extension icon (128×128) derived from logo-readme.png.
 * @returns {Promise<Buffer>}
 */
export async function icon128BufferFromLogoReadme() {
  const png = fs.readFileSync(logoReadmePath);
  return sharp(png).resize(128, 128).png().toBuffer();
}
