import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
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
  ["english install CTA", "index.html", /Install from Chrome Web Store/],
  ["english install section", "index.html", /Chrome Web Store listing coming soon/],
  ["english popup preview label", "index.html", /Popup preview/],
  ["english popup preview real copy", "index.html", /Lighten all windows/],
  ["privacy link", "index.html", /privacy\.html/],
  ["terms link", "index.html", /terms\.html/],
  ["english language switch", "index.html", /data-language-choice="ja"/],
  ["japanese alternate", "index.html", /hreflang="ja"/],
  ["contact email", "index.html", /subaruu0130@gmail\.com/i],
  ["language detector", "language.js", /navigator\.languages/],
  ["language preference", "language.js", /tabReliefPreferredLanguage/],
  ["japanese home title", "ja/index.html", /Chromeを軽く/],
  ["japanese install CTA", "ja/index.html", /Chrome Web Storeでインストール/],
  ["japanese install section", "ja/index.html", /Chrome Web Storeで公開予定です/],
  ["japanese popup preview label", "ja/index.html", /ポップアッププレビュー/],
  ["japanese popup preview real copy", "ja/index.html", /Chrome全体を軽くする/],
  ["japanese pricing", "ja/index.html", /14日間無料トライアル/],
  ["japanese monthly label", "ja/index.html", /月額/],
  ["japanese yearly label", "ja/index.html", /年額/],
  ["japanese monthly unit", "ja/index.html", /\/ 月/],
  ["japanese yearly unit", "ja/index.html", /\/ 年/],
  ["japanese reviewer access CTA", "ja/index.html", /審査・テスト用アクセスを依頼/],
  ["japanese support CTA", "ja/index.html", /サポートに連絡/],
  ["japanese natural FAQ heading", "ja/index.html", /申し込む前に、不安を残さない。/],
  ["japanese language switch", "ja/index.html", /data-language-choice="en"/],
  ["japanese privacy", "ja/privacy.html", /プライバシーポリシー/],
  ["japanese terms", "ja/terms.html", /メモリ削減量の保証はありません/],
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

for (const file of ["index.html", "privacy.html", "terms.html", "ja/index.html", "ja/privacy.html", "ja/terms.html"]) {
  const content = await readFile(path.join(root, file), "utf8");
  if (/笨|�/.test(content)) {
    failures.push(`Encoding artifact found in ${file}`);
  }
}

for (const file of ["index.html", "ja/index.html"]) {
  const content = await readFile(path.join(root, file), "utf8");
  if (/<button[^>]+class="mock-action"/.test(content)) {
    failures.push(`Mock preview action must not be a real button in ${file}`);
  }
  if (/popup-preview-(en|ja)\.png|mock-top|Actual popup screenshot|実際のポップアップ画面/.test(content)) {
    failures.push(`Landing preview must not use raw screenshots or fake window controls in ${file}`);
  }
}

const japaneseHome = await readFile(path.join(root, "ja/index.html"), "utf8");
for (const forbidden of [
  "課金前に、できることと限界を明確に。",
  "Monthly",
  "Yearly",
  "/ month",
  "/ year"
]) {
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
