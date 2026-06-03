import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "index.html",
  "privacy.html",
  "terms.html",
  "404.html",
  "styles.css",
  "assets/mark.svg",
  "robots.txt",
  "sitemap.xml"
];

const checks = [
  ["home title", "index.html", /<title>Tab Relief \| Keep Chrome lighter/i],
  ["pricing monthly", "index.html", /\$1\.30/],
  ["pricing yearly", "index.html", /\$10/],
  ["trial", "index.html", /14-day free trial/i],
  ["payment processors", "index.html", /ExtensionPay and Stripe/i],
  ["privacy link", "index.html", /privacy\.html/],
  ["terms link", "index.html", /terms\.html/],
  ["contact email", "index.html", /subaruu0130@gmail\.com/i],
  ["privacy data scope", "privacy.html", /Tab titles, domains, URLs/i],
  ["privacy payment details", "privacy.html", /does not store card numbers/i],
  ["terms refund", "terms.html", /Refund requests/i],
  ["terms memory guarantee", "terms.html", /No exact memory guarantee/i],
  ["focus styles", "styles.css", /:focus-visible/],
  ["mobile breakpoint", "styles.css", /@media \(max-width: 680px\)/]
];

const failures = [];

for (const file of requiredFiles) {
  try {
    await readFile(path.join(root, file), "utf8");
  } catch {
    failures.push(`Missing required file: ${file}`);
  }
}

for (const [name, file, pattern] of checks) {
  const content = await readFile(path.join(root, file), "utf8");
  if (!pattern.test(content)) {
    failures.push(`Failed check: ${name} in ${file}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`OK: ${requiredFiles.length} files and ${checks.length} content checks passed.`);
