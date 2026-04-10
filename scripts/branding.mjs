/**
 * Single source of truth for SVG → PNG rasterization.
 * icon-128.png and logo-readme.png MUST match buffers from this pipeline exactly.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.join(__dirname, "..");
export const svgPath = path.join(projectRoot, "media", "hydration-assistant-logo.svg");

/** Each output is produced only via sharp(svg) with these options — no other code path. */
export const BRANDING_OUTPUTS = [
  {
    key: "icon-128",
    file: "media/icon-128.png",
    render: (svgBuf) => sharp(svgBuf).resize(128, 128).png().toBuffer(),
  },
  {
    key: "logo-readme",
    file: "media/logo-readme.png",
    render: (svgBuf) => sharp(svgBuf).resize(320).png().toBuffer(),
  },
];

/**
 * @returns {Promise<Record<string, Buffer>>}
 */
export async function pngBuffersFromSvgFile() {
  const svg = fs.readFileSync(svgPath);
  const out = {};
  for (const spec of BRANDING_OUTPUTS) {
    out[spec.key] = await spec.render(svg);
  }
  return out;
}
