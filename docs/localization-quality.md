# Localization Quality

Tab Relief's landing page should read as native product copy in each supported language.

## Required Workflow

1. Define the page job first: explain the product, the pre-launch install state, the trial, and the paid plan clearly.
2. Write each locale for that audience instead of translating sentence-by-sentence.
3. Rewrite slogans and hero copy from the locale's natural sentence rhythm. Do not preserve the English clause order if it sounds stiff.
4. Keep billing terms close to the pricing section and FAQ.
5. Run `npm run copy-quality` before committing.
6. Add locale-specific banned phrases to `scripts/check-site.mjs` when adding a new language.
7. For every supported language, keep a required locale guide at `docs/locales/<language>.md`. The site check fails if the guide is missing.

## Scaling To More Languages

- Do not add many machine-translated pages at once.
- Add one language at a time.
- Do not publish a language unless its locale guide declares `Status: production-supported` or `Status: native-reviewed`.
- If native review is not available, keep that language blocked or fall back to English.
- Write hero copy, pricing copy, cancellation copy, and destructive-action explanations directly for the locale instead of translating the English line.

## Japanese Rules

- Prefer 「カード登録なしで14日間試せます」 over stiff payment wording.
- Use 「自動で有料プランに切り替わることはありません」 when explaining the trial.
- Use 「メールアドレスごとに1回」 for trial eligibility.
- Use 「契約・支払いページ」 for subscription management, receipts, cards, and cancellation.
- Prefer 「タブを閉じずに、Chromeを軽く。」 over literal slogan fragments such as 「Chromeを軽く。タブは残す。」.
- Avoid 「自動課金なし」, 「試用済み」, 「請求ポータル」, 「管理画面」, and vague 「アカウントページ」 in user-facing pages.

## English Rules

- Prefer clear sentences over compressed legal labels.
- Use “does not require a card” and “does not automatically become a paid plan” for the trial.
- Use “billing page” for subscription, card, receipt, and cancellation flows.
- Avoid internal concept labels such as “Calm SaaS”, “Store-ready”, and “Measured”.
