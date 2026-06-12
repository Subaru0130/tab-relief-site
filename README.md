# Tab Relief public site

This folder contains a public-safe GitHub Pages landing page for Tab Relief.

It is separate from the private extension repository on purpose: the public site explains the product, pricing, privacy policy, terms, and support contact without exposing the extension source code.

## Pages

- `index.html`: product landing page, install status, and pricing
- `privacy.html`: privacy policy for Chrome Web Store and Stripe review
- `terms.html`: terms, refund, and billing expectations
- `ja/`: Japanese landing page, privacy policy, and terms
- `language.js`: browser-language detection and manual language preference
- `404.html`: GitHub Pages fallback page

## Local check

```powershell
npm run check
```

## Add a locale draft

```powershell
npm run locale:draft -- fr "Français"
```

Rewrite the generated draft from `copy/site-spec.mjs` intent before enabling it in `copy/registry.mjs`.

## Visual preview capture

```powershell
$env:CHROME_BIN="C:\Path\To\chrome.exe"
npm run capture
```

Screenshots are written to `.tmp/`, including English and Japanese desktop/mobile previews.

## Publish with GitHub Pages

1. Create a public GitHub repository named `tab-relief-site`.
2. Push this folder to the repository's `main` branch.
3. Open GitHub repository settings.
4. Go to `Pages`.
5. Set `Source` to `Deploy from a branch`.
6. Select `main` and `/root`.
7. Save.
8. Use `https://subaru0130.github.io/tab-relief-site/` as the public website URL.

Use that URL for Stripe's website field while connecting Stripe to ExtensionPay.

## Design rationale

The page uses a restrained product-marketing layout inspired by mature SaaS pages from Stripe, Linear, Apple, and Material-style guidance:

- Strong hero first, then benefits, features, pricing, FAQ, and legal links.
- Install is treated as the primary product action. Before Chrome Web Store approval, the page shows a clear pre-launch status instead of pretending the store link is live.
- One primary action color: blue for install and subscription actions.
- Neutral surfaces and consistent card spacing so the content feels calmer than the extension problem it solves.
- Legal, payment, cancellation, and billing-management information is visible instead of hidden, which helps Stripe review and user trust.
- The public copy matches the extension flow: users start the card-free trial from the extension, choose a paid plan only when they want to continue, and manage or cancel later from the extension's Billing screen with ExtensionPay and Stripe handling billing.
- Mobile layout collapses into a single-column flow with full-width primary actions.
- English remains the default review URL, while Japanese users can be routed to `/ja/` through browser-language detection or a visible language switch.

## Update before final launch

- Replace the install status with the Chrome Web Store URL after publication.
- Update the contact email if a dedicated support address is created.
- Confirm final pricing in ExtensionPay and keep the page in sync.
