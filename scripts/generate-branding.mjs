import fs from "node:fs";
import path from "node:path";
import { ICON_OUTPUT, icon128BufferFromLogoReadme, projectRoot } from "./branding.mjs";

const buf = await icon128BufferFromLogoReadme();
const target = path.join(projectRoot, ICON_OUTPUT.file);
fs.writeFileSync(target, buf);

console.log(
  "Wrote",
  ICON_OUTPUT.file,
  "from media/logo-readme.png (see scripts/branding.mjs)"
);
