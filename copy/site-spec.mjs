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
    intent: "Point users directly to the live Chrome Web Store install path.",
    constraint: "Short CTA. It should clearly feel like the next step to install the extension."
  },
  trialNote: {
    surface: "landing hero",
    intent: "Clarify that install is free and the cleanup actions include a card-free 14-day trial.",
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
