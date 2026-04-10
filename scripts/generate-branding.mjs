import fs from "node:fs";
import path from "node:path";
import { BRANDING_OUTPUTS, pngBuffersFromSvgFile, projectRoot } from "./branding.mjs";

const buffers = await pngBuffersFromSvgFile();

for (const spec of BRANDING_OUTPUTS) {
  const target = path.join(projectRoot, spec.file);
  fs.writeFileSync(target, buffers[spec.key]);
}

console.log(
  "Wrote",
  BRANDING_OUTPUTS.map((o) => o.file).join(" and "),
  "from media/hydration-assistant-logo.svg (single pipeline — see scripts/branding.mjs)"
);
