// Source of truth for landing-page product copy.
// The static HTML should contain these strings, but copy decisions start here.

export const SUPPORTED_SITE_LANGUAGES = ["en", "ja"];

export const SITE_COPY = {
  heroTitle: {
    surface: "landing hero",
    intent: "Explain the core value in one first-glance sentence: Chrome feels lighter while tabs remain available.",
    constraint: "Short headline. Write natively for each locale instead of matching punctuation or word order.",
    en: "Keep Chrome lighter without closing your tabs.",
    ja: "タブを閉じずにChromeを軽く。"
  },
  heroLead: {
    surface: "landing hero",
    intent: "Explain what the extension actually does without overpromising exact memory savings.",
    constraint: "One readable paragraph. Mention sleeping tabs, workspaces, protected sites, and Chrome staying lighter.",
    en: "Tab Relief sleeps inactive tabs, saves messy windows as workspaces, and protects important sites so Chrome stays lighter without forcing you to close your work.",
    ja: "Tab Reliefは、使っていないタブを休止し、散らかった作業ウィンドウを保存し、重要なサイトは残したまま、Chromeを軽く保つための拡張機能です。"
  },
  primaryCta: {
    surface: "landing hero",
    intent: "Point users to the install path, even while the Chrome Web Store listing is still pending.",
    constraint: "Short CTA. It should not sound like a support inquiry.",
    en: "Get Tab Relief",
    ja: "Tab Reliefを入手"
  },
  trialNote: {
    surface: "landing hero",
    intent: "Clarify install status and the card-free 14-day trial before users click.",
    constraint: "Plain product note. Do not imply automatic paid conversion.",
    en: "Free to install after publication. Try the cleanup actions for 14 days without a card, then choose a plan if you want to keep using them.",
    ja: "公開後は無料でインストールできます。整理機能はカード登録なしで14日間試せます。続けて使う場合は月額または年額プランを選びます。"
  },
  closeFeatureTitle: {
    surface: "feature section",
    intent: "Name the destructive action plainly.",
    constraint: "Must say tabs are closed, not merely cleaned or organized.",
    en: "Close matching tabs",
    ja: "条件に合うタブを閉じる"
  },
  closeFeatureBody: {
    surface: "feature section",
    intent: "Explain that matching tabs are reviewed before closing.",
    constraint: "Mention review/control so the action does not feel risky.",
    en: "Pick common presets or type your own words to find matching tabs, then close them in a controlled review step.",
    ja: "よく使う条件や自分で入力した文字でタブを見つけ、確認してからまとめて閉じられます。"
  },
  pricingMonthly: {
    surface: "pricing panel",
    intent: "Show the monthly price plainly.",
    constraint: "Keep currency and cadence visible in both locales.",
    en: "$1.30 / month",
    ja: "$1.30 / 月"
  },
  pricingYearly: {
    surface: "pricing panel",
    intent: "Show the yearly price plainly.",
    constraint: "Keep currency and cadence visible in both locales.",
    en: "$12.99 / year",
    ja: "$12.99 / 年"
  },
  yearlySavings: {
    surface: "pricing panel",
    intent: "Make the yearly plan benefit easy to compare against monthly billing.",
    constraint: "Short support copy, not a second CTA.",
    en: "Yearly saves $2.61 compared with 12 monthly payments.",
    ja: "年払いなら月払い12カ月分より$2.61お得です。"
  }
};
