# Tab Relief Site Design Brief

Use this file before making UI or copy changes to the Tab Relief landing page.

## Active References

Read these reference files before major visual work:

- `../design-md-references/stripe.md`
- `../design-md-references/webflow.md`
- `../design-md-references/linear.app.md`

Use Stripe for trust, pricing, conversion hierarchy, and polished SaaS credibility.
Use Webflow for light marketing-page rhythm, spacious sections, and high-quality landing-page structure.
Use Linear for precise product proof, calm hierarchy, and avoiding noisy generic SaaS visuals.

Do not copy any brand directly.
Translate principles into Tab Relief's own identity.

## Product Job

The landing page must make a Chrome-heavy user understand this in five seconds:

Tab Relief keeps Chrome lighter without forcing the user to close important tabs.

## Visual Direction

- Keep a clean light SaaS surface.
- Use Tab Relief blue as the primary action color.
- Use neutral backgrounds and quiet borders for trust.
- Avoid random gradients, purple defaults, and decorative color noise.
- Product proof should support the CTA, not overpower it.
- The hero preview must stay close to the real extension UI.
- Do not use screenshot-like mockups unless they match the shipped UI closely.
- Avoid fake proof such as zero-value metrics, ungrounded lifetime claims, or invented huge savings.

## Copy Direction

- English should sound like a polished SaaS product, not technical documentation.
- Japanese should be natural product Japanese, not literal translation.
- Write the hero line directly for the locale. Do not mirror English fragment-by-fragment.
- For Japanese, avoid slogan fragments like 「Chromeを軽く。タブは残す。」. Prefer a complete, natural benefit sentence such as 「タブを閉じずに、Chromeを軽く。」.
- Every supported locale must have `docs/locales/<locale>.md` with tone, billing vocabulary, forbidden literal phrases, and marketing hero guidance before the locale can ship.
- Prefer user outcomes over implementation terms.
- Use "lighter Chrome", "keep your place", "save workspaces", and "protect important sites" as the core message.
- Pricing and install copy must make the pre-launch state obvious.
- Keep the trial terms aligned with the extension: the 14-day trial does not require a card and does not automatically become a paid plan.
- Avoid stiff Japanese billing labels such as 「自動課金なし」, 「試用済み」, 「請求ポータル」, and vague 「アカウントページ」. Prefer 「自動で有料プランに切り替わることはありません」, 「すでに無料トライアルを利用したメールアドレス」, and 「契約・支払いページ」.
- Do not leave design-process labels in user-facing pages. Avoid "Calm SaaS", "Store-ready", "Measured", or similar internal concept language.

## Layout Priorities

1. Headline promise.
2. Install or install-status CTA.
3. Product proof preview.
4. Feature summary.
5. Safety and billing reassurance.

The first glance should land on the headline, then the primary CTA, then the preview.
