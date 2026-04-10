/**
 * Fails if committed PNGs are not byte-identical to sharp output from hydration-assistant-logo.svg.
 * Run in CI and after editing SVG: npm run build:branding && npm run verify:branding
 */
import fs from "node:fs";
import path from "node:path";
import { BRANDING_OUTPUTS, pngBuffersFromSvgFile, projectRoot } from "./branding.mjs";

const expected = await pngBuffersFromSvgFile();
let failed = false;

for (const spec of BRANDING_OUTPUTS) {
  const abs = path.join(projectRoot, spec.file);
  if (!fs.existsSync(abs)) {
    console.error(`Missing ${spec.file}. Run: npm run build:branding`);
    failed = true;
    continue;
  }
  const onDisk = fs.readFileSync(abs);
  const a = expected[spec.key];
  if (onDisk.length !== a.length || !onDisk.equals(a)) {
    console.error(
      `${spec.file} does not match SVG rasterization. Do not edit PNGs by hand. Run: npm run build:branding`
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("Branding PNGs match hydration-assistant-logo.svg (exact).");
