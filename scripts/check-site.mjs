import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { SITE_COPY, SITE_COPY_SPECS, SITE_LOCALES, SUPPORTED_SITE_LANGUAGES } from "../copy/site-copy.mjs";

const root = process.cwd();
const supportedLocales = ["en", "ja"];
const chromeWebStoreUrlPattern = /https:\/\/chromewebstore\.google\.com\/detail\/tab-relief-[^"']+\/bfjbegepdhpdmandaeoaglgphegpfeak/;
const trackedStorePages = new Map([
  ["index.html", "homepage_en"],
  ["ja/index.html", "homepage_ja"],
  ["tab-suspender-chrome-mv3.html", "seo_tab_suspender_mv3_en"]
]);
const articleAccuracyChecks = [
  ["tab-suspender-chrome-mv3.html", [
    "https://support.google.com/chrome/answer/12929150?hl=en",
    "https://developer.chrome.com/docs/extensions/reference/api/tabs#method-discard",
    "https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle"
  ]]
];
const requiredFiles = [
  "index.html",
  "privacy.html",
  "terms.html",
  "language.js",
  "ja/index.html",
  "ja/privacy.html",
  "ja/terms.html",
  "404.html",
  "styles.css",
  "landing.css",
  "assets/mark.svg",
  "copy/site-copy.mjs",
  "copy/site-spec.mjs",
  "copy/registry.mjs",
  "copy/locales/en.mjs",
  "copy/locales/ja.mjs",
  "docs/locales/en.md",
  "docs/locales/ja.md",
  "robots.txt",
  "sitemap.xml"
];

const checks = [
  ["english title", "index.html", new RegExp(`<title>Tab Relief \\| ${escapeRegExp(SITE_COPY.heroTitle.en)}</title>`)],
  ["english language switch", "index.html", /data-language-choice="ja"[\s\S]*日本語/],
  ["english hero", "index.html", new RegExp(escapeRegExp(SITE_COPY.heroTitle.en))],
  ["english install CTA", "index.html", new RegExp(escapeRegExp(SITE_COPY.primaryCta.en))],
  ["english close feature", "index.html", new RegExp(`${escapeRegExp(SITE_COPY.closeFeatureTitle.en)}[\\s\\S]*${escapeRegExp("controlled review step")}`)],
  ["english pricing", "index.html", /\$1\.30[\s\S]*\$12\.99[\s\S]*does not require a card[\s\S]*will not become a paid plan automatically/],
  ["english first-time trial", "terms.html", /one use per email address/],
  ["english billing route", "index.html", /Open Billing in the extension[\s\S]*manage or cancel/],
  ["english processors", "privacy.html", /ExtensionPay and Stripe/],
  ["english install action", "index.html", /Install from Chrome Web Store/],
  ["english chrome web store link", "index.html", chromeWebStoreUrlPattern],
  ["japanese title", "ja/index.html", new RegExp(`<title>Tab Relief \\| ${escapeRegExp(SITE_COPY.heroTitle.ja)}</title>`)],
  ["japanese language switch", "ja/index.html", /data-language-choice="en"[\s\S]*日本語/],
  ["japanese hero", "ja/index.html", new RegExp(escapeRegExp(SITE_COPY.heroTitle.ja))],
  ["japanese install CTA", "ja/index.html", new RegExp(escapeRegExp(SITE_COPY.primaryCta.ja))],
  ["japanese chrome web store link", "ja/index.html", chromeWebStoreUrlPattern],
  ["japanese close feature", "ja/index.html", new RegExp(`${escapeRegExp(SITE_COPY.closeFeatureTitle.ja)}[\\s\\S]*${escapeRegExp("確認してから")}[\\s\\S]*${escapeRegExp("まとめて閉じられます")}`)],
  ["japanese pricing", "ja/index.html", new RegExp(`${escapeRegExp("$1.30")}[\\s\\S]*${escapeRegExp("/ 月")}[\\s\\S]*${escapeRegExp("$12.99")}[\\s\\S]*${escapeRegExp("/ 年")}`)],
  ["japanese trial", "ja/index.html", /カード登録なし[\s\S]*14日間無料トライアル[\s\S]*自動で有料プランに切り替わることはありません/],
  ["japanese billing route", "ja/index.html", /「契約・支払い」画面[\s\S]*管理またはキャンセル/],
  ["privacy link", "index.html", /privacy\.html/],
  ["terms link", "index.html", /terms\.html/],
  ["contact email", "index.html", /subaruu0130@gmail\.com/i],
  ["language detector", "language.js", /navigator\.languages/],
  ["language preference", "language.js", /tabReliefPreferredLanguage/],
  ["landing focus styles", "landing.css", /:focus-visible/],
  ["landing mobile breakpoint", "landing.css", /@media \(max-width: 640px\)/],
  ["privacy data scope", "privacy.html", /Tab titles, domains, URLs/i],
  ["privacy payment details", "privacy.html", /does not store card numbers/i],
  ["privacy billing route", "privacy.html", /Billing screen inside the extension/i],
  ["terms refund", "terms.html", /Refund requests/i],
  ["terms first-time trial", "terms.html", /one use per email address/i],
  ["terms billing route", "terms.html", /Billing screen inside the extension/i],
  ["terms memory guarantee", "terms.html", /No exact memory guarantee/i]
];

const failures = [];

checkSiteCopySource();

for (const file of requiredFiles) {
  try {
    await readFile(path.join(root, file), "utf8");
  } catch {
    failures.push(`Missing required file: ${file}`);
  }
}

await checkLocaleGuides(supportedLocales);
await checkSiteCopyPresence();
await checkTrackedStoreLinks();
await checkArticleAccuracy();
await checkJapaneseEditorialStructure();

for (const [name, file, pattern] of checks) {
  const content = await readFile(path.join(root, file), "utf8");
  if (!pattern.test(content)) {
    failures.push(`Failed check: ${name} in ${file}`);
  }
}

const japaneseTerms = await readFile(path.join(root, "ja/terms.html"), "utf8");
if (!/メールアドレスごとに1回[\s\S]*同じメールアドレス/.test(japaneseTerms)) {
  failures.push("Failed check: japanese first-time trial in ja/terms.html");
}

for (const file of ["index.html", "ja/index.html", "terms.html", "ja/terms.html", "privacy.html", "ja/privacy.html", "concepts/option-1.html", "concepts/option-2.html", "concepts/option-3.html"]) {
  const content = await readFile(path.join(root, file), "utf8");
  if (/縺|繧|譌|隱|蜷|莨/.test(content)) {
    failures.push(`Encoding artifact found in ${file}`);
  }
  for (const forbidden of [
    "Measured",
    "Calm SaaS",
    "Store-ready",
    "moon",
    "Safe</span>",
    "Guarded</span>",
    "Review</span>",
    "What it controls",
    "Light by default. Careful when it matters.",
    "Lighten Chrome. Keep your tabs.",
    "messy workspaces",
    "Close matching clutter",
    "matching tab clutter",
    "Chrome toolbar",
    "product-stage",
    "Click the Tab Relief icon. This popup opens.",
    "Memory estimate",
    "Lightened now",
    "Total lightened"
  ]) {
    if (content.includes(forbidden)) {
      failures.push(`Confusing or placeholder copy found in ${file}: ${forbidden}`);
    }
  }
  if (/(^|>|\s)0\s*MB(\s|<|$)/.test(content)) {
    failures.push(`Value-killing zero metric found in ${file}`);
  }
  for (const forbidden of [
    "Payment method required",
    "requires a payment method",
    "billing portal",
    "請求ポータル",
    "支払い方法を登録",
    "自動更新されます",
    "初回利用",
    "試用済み",
    "自動課金",
    "サブスク",
    "アカウントページ",
    "管理画面"
  ]) {
    if (content.includes(forbidden)) {
      failures.push(`Unnatural or outdated billing copy found in ${file}: ${forbidden}`);
    }
  }
}

const japaneseHome = await readFile(path.join(root, "ja/index.html"), "utf8");
for (const forbidden of ["Monthly", "Yearly", "/ month", "/ year", "Chromeを軽くすることを試す", "Chromeを軽く。タブは残す。", "タブは残す。"]) {
  if (japaneseHome.includes(forbidden)) {
    failures.push(`Unnatural or untranslated Japanese home copy found: ${forbidden}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

const languageScript = await readFile(path.join(root, "language.js"), "utf8");
for (const scenario of [
  {
    name: "Japanese browser home",
    input: { pathname: "/tab-relief-site/index.html", search: "", languages: ["ja-JP"] },
    expected: "ja/index.html"
  },
  {
    name: "English override home",
    input: { pathname: "/tab-relief-site/index.html", search: "?lang=en", languages: ["ja-JP"] },
    expected: ""
  },
  {
    name: "Japanese browser privacy",
    input: { pathname: "/tab-relief-site/privacy.html", search: "", languages: ["ja-JP"] },
    expected: "ja/privacy.html"
  },
  {
    name: "Saved English from Japanese page",
    input: { pathname: "/tab-relief-site/ja/index.html", search: "", languages: ["ja-JP"], saved: "en" },
    expected: "../?lang=en"
  }
]) {
  const actual = simulateLanguageRoute(languageScript, scenario.input);
  if (actual !== scenario.expected) {
    failures.push(`Language route failed for ${scenario.name}: expected "${scenario.expected}", got "${actual}"`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`OK: ${requiredFiles.length} files and ${checks.length} content checks passed.`);

function checkSiteCopySource() {
  if (JSON.stringify(SUPPORTED_SITE_LANGUAGES) !== JSON.stringify(supportedLocales)) {
    failures.push("SUPPORTED_SITE_LANGUAGES should match the public supported locales.");
  }

  for (const locale of supportedLocales) {
    if (!SITE_LOCALES[locale]) {
      failures.push(`SITE_LOCALES is missing ${locale}.`);
      continue;
    }
    if (!["production-supported", "native-reviewed"].includes(SITE_LOCALES[locale].status)) {
      failures.push(`${locale} should not be public until native-reviewed or production-supported.`);
    }
    if (!SITE_LOCALES[locale].nativeName || !SITE_LOCALES[locale].direction) {
      failures.push(`${locale} needs nativeName and direction metadata.`);
    }
  }

  const metadataKeys = ["surface", "intent", "constraint"];
  for (const [key, spec] of Object.entries(SITE_COPY_SPECS)) {
    const unexpectedKeys = Object.keys(spec).filter((field) => !metadataKeys.includes(field));
    if (unexpectedKeys.length) {
      failures.push(`SITE_COPY_SPECS.${key} should only contain communication metadata, not locale strings.`);
    }
  }

  for (const [key, copy] of Object.entries(SITE_COPY)) {
    for (const metadataKey of metadataKeys) {
      if (typeof copy[metadataKey] !== "string" || copy[metadataKey].trim().length < 8) {
        failures.push(`SITE_COPY.${key}.${metadataKey} should explain the communication job.`);
      }
    }
    for (const locale of SUPPORTED_SITE_LANGUAGES) {
      if (typeof copy[locale] !== "string" || copy[locale].trim().length === 0) {
        failures.push(`SITE_COPY.${key}.${locale} is missing.`);
      }
    }
  }

  const expectedKeys = Object.keys(SITE_COPY_SPECS).sort();
  for (const locale of supportedLocales) {
    const localeKeys = Object.keys(SITE_LOCALES[locale].messages).sort();
    if (JSON.stringify(localeKeys) !== JSON.stringify(expectedKeys)) {
      failures.push(`${locale} landing messages must exactly match site copy specs.`);
    }
  }
}

async function checkSiteCopyPresence() {
  const englishHome = await readFile(path.join(root, "index.html"), "utf8");
  const japaneseHome = await readFile(path.join(root, "ja/index.html"), "utf8");
  const englishReadable = readableText(englishHome);
  const japaneseReadable = readableText(japaneseHome);

  for (const [key, copy] of Object.entries(SITE_COPY)) {
    if (!containsCopy(englishHome, englishReadable, copy.en)) {
      failures.push(`English landing page is missing SITE_COPY.${key}.en`);
    }
    if (!containsCopy(japaneseHome, japaneseReadable, copy.ja)) {
      failures.push(`Japanese landing page is missing SITE_COPY.${key}.ja`);
    }
  }
}

async function checkLocaleGuides(locales) {
  const requiredSections = [
    "## Native Quality Status",
    "## Tone",
    "## Billing Vocabulary",
    "## Forbidden Literal Phrases",
    "## Marketing And Hero Copy"
  ];

  for (const locale of locales) {
    const guidePath = `docs/locales/${locale}.md`;
    const guide = await readFile(path.join(root, guidePath), "utf8");
    for (const section of requiredSections) {
      if (!guide.includes(section)) {
        failures.push(`${guidePath} is missing required section: ${section}`);
      }
    }
    if (!/Status:\s*production-supported|Status:\s*native-reviewed|Status:\s*blocked-until-native-review/.test(guide)) {
      failures.push(`${guidePath} must declare a native quality status.`);
    }
  }
}

async function checkTrackedStoreLinks() {
  for (const [file, expectedCampaign] of trackedStorePages) {
    const content = await readFile(path.join(root, file), "utf8");
    const links = [...content.matchAll(/href="([^"]*chromewebstore\.google\.com\/detail\/[^"]*bfjbegepdhpdmandaeoaglgphegpfeak[^"]*)"/g)];

    if (!links.length) {
      failures.push(`No Chrome Web Store link found in ${file}.`);
      continue;
    }

    for (const [, rawHref] of links) {
      const trackedUrl = new URL(rawHref.replaceAll("&amp;", "&"));
      const expected = {
        utm_source: "tab_relief_site",
        utm_medium: "referral",
        utm_campaign: expectedCampaign
      };

      for (const [parameter, value] of Object.entries(expected)) {
        if (trackedUrl.searchParams.get(parameter) !== value) {
          failures.push(`${file} store link must set ${parameter}=${value}.`);
        }
      }

      if (!trackedUrl.searchParams.get("utm_content")) {
        failures.push(`${file} store link must include utm_content.`);
      }
    }
  }
}

async function checkArticleAccuracy() {
  const forbiddenClaims = [
    /Memory Saver \(called ["']Energy Saver["'] on some builds\)/i,
    /same (?:underlying )?<code>chrome\.tabs\.discard\(\)<\/code> API as Chrome(?:'s|’s) Memory Saver/i,
    /same<code>chrome\.tabs\.discard\(\)<\/code>API/i,
    /Every active Chrome extension runs a background service worker that consumes memory/i,
    /有効になっているChrome拡張機能は、それぞれバックグラウンドで動作しメモリを消費します/,
    /(?:typically frees|typically recovers|回収できます|解放されることがあります)[^<]*\d+[^<]*MB/i,
    /\d+[–〜-]\d+\s*MB[^<]*(?:frees|recovers|回収|解放)/i
  ];

  for (const [file, requiredSources] of articleAccuracyChecks) {
    const content = await readFile(path.join(root, file), "utf8");
    for (const source of requiredSources) {
      if (!content.includes(source)) {
        failures.push(`${file} is missing official source: ${source}`);
      }
    }
    for (const claim of forbiddenClaims) {
      if (claim.test(content)) {
        failures.push(`Unsupported or misleading claim found in ${file}: ${claim}`);
      }
    }
  }
}

async function checkJapaneseEditorialStructure() {
  const reservedPages = new Set(["index.html", "privacy.html", "terms.html"]);
  const files = (await readdir(path.join(root, "ja"), { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html") && !reservedPages.has(entry.name))
    .map((entry) => `ja/${entry.name}`);

  for (const file of files) {
    const content = await readFile(path.join(root, file), "utf8");
    if (/<p class="meta">/.test(content) || /読了目安|最終確認日|制作中/.test(content)) {
      failures.push(`${file} should not show editorial metadata that does not help the reader.`);
    }

    const headings = [...content.matchAll(/<h2>([\s\S]*?)<\/h2>/g)]
      .map((match) => readableText(match[1]));
    for (const heading of headings) {
      if (heading.length > 30) {
        failures.push(`${file} has an overlong Japanese heading: ${heading}`);
      }
    }

    const paragraphs = [...content.matchAll(/<p>([\s\S]*?)<\/p>/g)]
      .map((match) => readableText(match[1]));
    for (const paragraph of paragraphs) {
      const sentences = paragraph.split(/[。！？]/).map((sentence) => sentence.trim()).filter(Boolean);
      if (sentences.some((sentence) => sentence.length > 90)) {
        failures.push(`${file} has a Japanese sentence that is too long for an easy read: ${paragraph}`);
      }
    }
  }
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readableText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsCopy(html, readable, copy) {
  return html.includes(copy)
    || readable.includes(copy)
    || compactText(readable).includes(compactText(copy));
}

function compactText(value) {
  return String(value).replace(/\s+/g, "");
}

function simulateLanguageRoute(source, input) {
  let replacement = "";
  const storage = new Map();
  if (input.saved) storage.set("tabReliefPreferredLanguage", input.saved);
  const context = {
    URLSearchParams,
    Set,
    String,
    navigator: { languages: input.languages, language: input.languages?.[0] || "" },
    document: { addEventListener() {} },
    window: {
      location: {
        pathname: input.pathname,
        search: input.search,
        replace(value) {
          replacement = value;
        }
      },
      localStorage: {
        getItem(key) {
          return storage.get(key) || null;
        },
        setItem(key, value) {
          storage.set(key, value);
        }
      }
    }
  };
  vm.runInNewContext(source, context);
  return replacement;
}
