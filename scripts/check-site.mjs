import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const supportedLocales = ["en", "ja"];
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
  "docs/locales/en.md",
  "docs/locales/ja.md",
  "robots.txt",
  "sitemap.xml"
];

const checks = [
  ["english title", "index.html", /<title>Tab Relief \| Lighten Chrome\. Keep your tabs\.<\/title>/],
  ["english language switch", "index.html", /data-language-choice="ja"[\s\S]*日本語/],
  ["english hero", "index.html", /Lighten Chrome\. Keep your tabs\./],
  ["english install CTA", "index.html", /Get Tab Relief/],
  ["english close feature", "index.html", /Close matching clutter[\s\S]*controlled review step/],
  ["english pricing", "index.html", /\$1\.30[\s\S]*\$12\.99[\s\S]*does not require a card[\s\S]*will not become a paid plan automatically/],
  ["english first-time trial", "index.html", /limited to one per email address/],
  ["english billing route", "index.html", /Open Billing in the extension[\s\S]*manage or cancel/],
  ["english processors", "index.html", /ExtensionPay and Stripe/],
  ["english install status", "index.html", /Preparing for Chrome Web Store publication/],
  ["japanese title", "ja/index.html", /<title>Tab Relief \| タブを閉じずに、Chromeを軽く。<\/title>/],
  ["japanese language switch", "ja/index.html", /data-language-choice="en"[\s\S]*日本語/],
  ["japanese hero", "ja/index.html", /タブを閉じずに、[\s\S]*Chromeを軽く。/],
  ["japanese install CTA", "ja/index.html", /Tab Reliefを入手/],
  ["japanese close feature", "ja/index.html", /条件に合うタブを閉じる[\s\S]*確認してから[\s\S]*まとめて閉じられます/],
  ["japanese pricing", "ja/index.html", /\$1\.30[\s\S]*\/ 月[\s\S]*\$12\.99[\s\S]*\/ 年/],
  ["japanese trial", "ja/index.html", /カード登録なし[\s\S]*14日間無料トライアル[\s\S]*自動で有料プランに切り替わることはありません/],
  ["japanese billing route", "ja/index.html", /「請求」画面[\s\S]*契約・支払いページ[\s\S]*管理またはキャンセル/],
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

for (const file of requiredFiles) {
  try {
    await readFile(path.join(root, file), "utf8");
  } catch {
    failures.push(`Missing required file: ${file}`);
  }
}

await checkLocaleGuides(supportedLocales);

for (const [name, file, pattern] of checks) {
  const content = await readFile(path.join(root, file), "utf8");
  if (!pattern.test(content)) {
    failures.push(`Failed check: ${name} in ${file}`);
  }
}

const japaneseIndex = await readFile(path.join(root, "ja/index.html"), "utf8");
const japaneseTerms = await readFile(path.join(root, "ja/terms.html"), "utf8");
if (!/メールアドレスごとに1回/.test(japaneseIndex)) {
  failures.push("Failed check: japanese first-time trial in ja/index.html");
}
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
