// Landing-page copy communication jobs.
// This file defines what each message must communicate, not how a locale phrases it.

export const SITE_COPY_SPECS = {
  heroTitle: {
    surface: "landing hero",
    intent: "Explain the core value in one first-glance sentence: Chrome feels lighter while tabs remain available.",
    constraint: "Short headline. Write natively for each locale instead of matching punctuation or word order."
  },
  heroLead: {
    surface: "landing hero",
    intent: "Explain what the extension actually does without overpromising exact memory savings.",
    constraint: "One readable paragraph. Mention sleeping tabs, workspaces, protected sites, and Chrome staying lighter."
  },
  primaryCta: {
    surface: "landing hero",
    intent: "Point users to the install path, even while the Chrome Web Store listing is still pending.",
    constraint: "Short CTA. It should not sound like a support inquiry."
  },
  trialNote: {
    surface: "landing hero",
    intent: "Clarify install status and the card-free 14-day trial before users click.",
    constraint: "Plain product note. Do not imply automatic paid conversion."
  },
  closeFeatureTitle: {
    surface: "feature section",
    intent: "Name the destructive action plainly.",
    constraint: "Must say tabs are closed, not merely cleaned or organized."
  },
  closeFeatureBody: {
    surface: "feature section",
    intent: "Explain that matching tabs are reviewed before closing.",
    constraint: "Mention review/control so the action does not feel risky."
  },
  pricingMonthly: {
    surface: "pricing panel",
    intent: "Show the monthly price plainly.",
    constraint: "Keep currency and cadence visible in both locales."
  },
  pricingYearly: {
    surface: "pricing panel",
    intent: "Show the yearly price plainly.",
    constraint: "Keep currency and cadence visible in both locales."
  },
  yearlySavings: {
    surface: "pricing panel",
    intent: "Make the yearly plan benefit easy to compare against monthly billing.",
    constraint: "Short support copy, not a second CTA."
  }
};
