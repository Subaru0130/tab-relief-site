# Localization Quality

Tab Relief's landing page should read as native product copy in each supported language, not as a translated version of another page.

The copy source is split into three layers:

- `copy/site-spec.mjs`: what each landing-page message must communicate.
- `copy/locales/<language>.mjs`: how that language says it.
- `copy/registry.mjs`: which locales are public and reviewed.

## Required Workflow

1. Define the page job first: explain the product, the pre-launch install state, the trial, and the paid plan clearly.
2. Add or edit the message intent in `copy/site-spec.mjs`.
3. Write each locale independently from that intent. Do not translate sentence-by-sentence.
4. Rewrite slogans and hero copy from the locale's natural sentence rhythm.
5. Keep billing terms close to the pricing section and FAQ.
6. Run `npm run check` before committing.
7. For every supported language, keep a required locale guide at `docs/locales/<language>.md`.

## Scaling To More Languages

- Add one language at a time with `npm run locale:draft -- <code> "<Native name>"`.
- Keep draft locales unregistered until their copy is rewritten from intent and reviewed.
- Do not publish a language unless its locale guide declares `Status: production-supported` or `Status: native-reviewed`.
- If native review is not available, keep that language blocked or fall back to English.
- Write hero copy, pricing copy, cancellation copy, and destructive-action explanations directly for the locale instead of translating the English line.

## Japanese Rules

- Prefer natural product Japanese over literal English rhythm.
- Use complete benefit sentences for the hero. For example, `タブを閉じずにChromeを軽く。` is acceptable because it reads as a Japanese landing-page promise.
- Explain the card-free trial plainly: `カード登録なしで14日間試せます`.
- Explain automatic billing plainly: `自動で有料プランに切り替わることはありません`.
- Use `メールアドレスごとに1回` for trial eligibility.
- Use `契約・支払いページ` for subscription management, receipts, cards, and cancellation.
- Avoid stiff or vague labels such as `自動課金なし`, `試用済み`, `請求ポータル`, `管理画面`, and `アカウントページ` in user-facing pages.

## English Rules

- Prefer clear sentences over compressed legal labels.
- Use `does not require a card` and `does not automatically become a paid plan` for the trial.
- Use `Billing page` for subscription, card, receipt, and cancellation flows.
- Avoid internal concept labels such as `Calm SaaS`, `Store-ready`, and `Measured`.
