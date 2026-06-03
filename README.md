# Tab Relief public site

This folder contains a public-safe GitHub Pages landing page for Tab Relief.

It is separate from the private extension repository on purpose: the public site explains the product, pricing, privacy policy, terms, and support contact without exposing the extension source code.

## Pages

- `index.html`: product landing page and pricing
- `privacy.html`: privacy policy for Chrome Web Store and Stripe review
- `terms.html`: terms, refund, and billing expectations
- `404.html`: GitHub Pages fallback page

## Local check

```powershell
npm run check
```

## Visual preview capture

```powershell
$env:CHROME_BIN="C:\Path\To\chrome.exe"
npm run capture
```

Screenshots are written to `.tmp/home-desktop.png` and `.tmp/home-mobile.png`.

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
- One primary action color: blue for pricing/contact actions.
- Neutral surfaces and consistent card spacing so the content feels calmer than the extension problem it solves.
- Legal, payment, and refund information is visible instead of hidden, which helps Stripe review and user trust.
- Mobile layout collapses into a single-column flow with full-width primary actions.

## Update before final launch

- Replace the review-access mail link with the Chrome Web Store URL after publication.
- Update the contact email if a dedicated support address is created.
- Confirm final pricing in ExtensionPay and keep the page in sync.
