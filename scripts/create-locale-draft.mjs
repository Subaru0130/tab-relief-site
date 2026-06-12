import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { SITE_COPY_SPECS } from "../copy/site-spec.mjs";
import { SITE_LOCALES } from "../copy/registry.mjs";

const [code, nativeName = code] = process.argv.slice(2);

if (!code || !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(code)) {
  console.error('Usage: npm run locale:draft -- <locale-code> "<Native name>"');
  console.error('Example: npm run locale:draft -- fr "Français"');
  process.exit(1);
}

if (SITE_LOCALES[code]) {
  console.error(`${code} is already registered in copy/registry.mjs.`);
  process.exit(1);
}

mkdirSync("copy/locales", { recursive: true });
mkdirSync("docs/locales", { recursive: true });

const localePath = `copy/locales/${code}.draft.mjs`;
const guidePath = `docs/locales/${code}.md`;

if (existsSync(localePath) || existsSync(guidePath)) {
  console.error(`Draft files already exist for ${code}.`);
  process.exit(1);
}

const englishMessages = SITE_LOCALES.en.messages;
const draftMessages = Object.fromEntries(
  Object.keys(SITE_COPY_SPECS).map((key) => [key, `[${code} draft] ${englishMessages[key]}`])
);

writeFileSync(
  localePath,
  `// Draft landing-page locale for ${nativeName}. Do not import this file in registry.mjs until native-reviewed.\n// Rewrite every string from copy/site-spec.mjs intent and constraint before release.\n\nexport const MESSAGES = ${serialize(draftMessages)};\n`,
  "utf8"
);

writeFileSync(
  guidePath,
  `# Locale: ${nativeName}\n\n## Native Quality Status\n\nStatus: blocked-until-native-review\n\nThis locale is a draft. Do not enable it in \\`copy/registry.mjs\\` until a native-quality review is complete.\n\n## Tone\n\n- TODO: Define the landing-page tone for ${nativeName}.\n- TODO: Note how direct, formal, or conversational CTA language should be.\n\n## Billing Vocabulary\n\n- TODO: Define natural words for trial, subscription, billing, receipt, cancellation, and payment method.\n- TODO: State how to explain card-free trials and automatic billing clearly.\n\n## Forbidden Literal Phrases\n\nThis section is a regression guard only. The primary workflow is still to write from \\`copy/site-spec.mjs\\` intent.\n\n- TODO: Add phrases that sound machine-translated or unnatural in ${nativeName}.\n\n## Marketing And Hero Copy\n\n- TODO: Define the natural hero rhythm for ${nativeName}.\n- TODO: Define how to describe sleeping tabs versus closing tabs without ambiguity.\n`,
  "utf8"
);

console.log(`Created ${localePath} and ${guidePath}. Keep this locale unregistered until native-reviewed.`);

function serialize(value) {
  return JSON.stringify(value, null, 2).replace(/"([A-Za-z_$][A-Za-z0-9_$]*)":/g, "$1:");
}
