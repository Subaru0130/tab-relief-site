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
  ["privacy link", "index.html", /privacy\.html/],
  ["terms link", "index.html", /terms\.html/],
  ["english language switch", "index.html", /data-language-choice="ja"/],
  ["japanese alternate", "index.html", /hreflang="ja"/],
  ["contact email", "index.html", /subaruu0130@gmail\.com/i],
  ["language detector", "language.js", /navigator\.languages/],
  ["language preference", "language.js", /tabReliefPreferredLanguage/],
  ["japanese home title", "ja/index.html", /Chromeを軽く/],
  ["japanese pricing", "ja/index.html", /14日間無料トライアル/],
  ["japanese reviewer access CTA", "ja/index.html", /審査・テスト用アクセスを依頼/],
  ["japanese support CTA", "ja/index.html", /サポートに問い合わせる/],
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
