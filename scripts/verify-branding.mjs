/**
 * Fails if icon-128.png is not byte-identical to Sharp output from media/logo-readme.png.
 */
import fs from "node:fs";
import path from "node:path";
import { ICON_OUTPUT, icon128BufferFromLogoReadme, logoReadmePath, projectRoot } from "./branding.mjs";

if (!fs.existsSync(logoReadmePath)) {
  console.error("Missing media/logo-readme.png (master logo). Add it, then run: npm run build:branding");
  process.exit(1);
}

const expected = await icon128BufferFromLogoReadme();
const abs = path.join(projectRoot, ICON_OUTPUT.file);

if (!fs.existsSync(abs)) {
  console.error(`Missing ${ICON_OUTPUT.file}. Run: npm run build:branding`);
  process.exit(1);
}

const onDisk = fs.readFileSync(abs);
if (onDisk.length !== expected.length || !onDisk.equals(expected)) {
  console.error(
    `${ICON_OUTPUT.file} does not match resize of logo-readme.png. Run: npm run build:branding`
  );
  process.exit(1);
}

console.log("icon-128.png matches media/logo-readme.png (exact).");
