# Simplification pass

Owner feedback: *"Simplify, reduce text quantity, revise flows so that context is only given when necessary. Two top bars on homepage is too busy; demo banners only on demo/app pages."*

Binding rules: `monark-brand-guidelines.md` §2 "The product brand", §8 "Restraint", §10 and §11. Method: the checklist in the TrustRate pilot (`sites/address-review-system/docs/simplification.md` §4).

How the numbers are measured (both scripts in `scripts/`, run against `pnpm start -p 3136`):

- `node scripts/wordcount.mjs`: words per page, English, 1440px. *Visible* is the `innerText` of `<main>` (includes screen-reader-only text); *total* also counts closed disclosures and FAQ answers; *chrome* is header and footer. On `/app` pages the app bar is inside `<main>`, and the contact list, contact page and hero card include seeded data (names, roles, notes, amounts).
- `node scripts/dictcount.mjs`: words of UI copy in `src/i18n/dictionaries/{en,fr}.ts`, per section.

## 1. Before

| Page | Visible in main | Total in main | Chrome |
|-|-:|-:|-:|
| Home | 679 | 858 | 82 |
| How it works | 653 | 653 | 82 |
| Credits | 113 | 113 | 82 |
| 404 | 33 | 33 | 82 |
| App: unlock gate | 62 | 62 | 86 |
| App: contacts | 243 | 243 | 87 |
| App: contact (Malik) | 172 | 173 | 87 |
| App: add a contact | 187 | 187 | 87 |
| App: check (lookalike verdict) | 227 | 227 | 87 |
| App: connected apps | 236 | 236 | 87 |
| **Total** | **2,605** | **2,785** | **849** |

Dictionary copy: **EN 3,880 words**, FR 4,250.

Inventory of what was loaded:

- **Header**: "TrustList · by Monark" pairing (two lines below `lg`), links centred-right, EN/FR, theme, action; inside the app an extra dashed "Demo · simulated data" badge. Menu button from `md`, not `lg`.
- **Footer**: legal band repeated the testnet line on every page; 25-word product line; no "built by Monark" line.
- **Home**: hero with eyebrow, 38-word subline and a "Demo · simulated data" line under the buttons, then **7 sections**: three outcomes (restating the hero and the next three sections), "Check before you send" (eyebrow + 40-word body), "Private by default" (intro + three 20–25-word cards with an example line each + a notes pill), "One list, every app" (27-word body), "Who keeps a TrustList" (25-word cards), a 6-question FAQ, and a closing with a body line. Two section dividers.
- **How it works**: eyebrow, 38-word intro, 20–25-word section bodies, 6 anatomy parts with a body each, 15–25-word check steps, a 50-word developer paragraph with scopes and code always open, CTA with a body line.
- **App**: two bars under the header (network badge + testnet notice + demo controls, then the tabs). Unlock gate with three bullet points. Intro paragraphs on check, add-contact and apps. Form hints under the address, tags, trust (4 lines), note and visibility; a fee line **and** the testnet notice above the save button. The testnet notice also under "Vouch publicly" and in the change-visibility dialog. A permanent "What apps never see" panel, scope descriptions on every scope. Toasts that repeated what the screen already showed (flag, publish, verify, vouch, trust change, visibility change, grant, revoke). Two-sentence empty and error states.

## 2. What changed

No feature or flow was removed.

### Header and footer (brand standard §2, §10)
- **Brand**: butterfly mark 28px + "TrustList" in Nunito Sans 800 18px on one line (`src/components/site/brand.tsx`), no "by Monark". Accessible label "TrustList, by Monark: home".
- **Links left**, right after the brand (28px), muted, active page in foreground (no pill highlight).
- **Right side**: Demo chip (`demo-chip.tsx`, primary 8% light / 15% dark, primary-ink text) → EN/FR pill → 36px theme toggle → primary action ("Launch demo", or the connect-wallet control inside the app).
- **Below `lg`**: brand + menu button only; the sheet holds links, Demo chip, EN/FR, theme and action.
- Removed `pairing.tsx` and the in-app `app-demo-badge.tsx` (the Demo chip is site-wide now).
- **Footer**: Monark band opens with "TrustList is built by Monark" / « TrustList est conçu par Monark »; product line 25 → 13 words; legal band keeps "Demo · simulated data" only (testnet line removed).
- Marketing pages: exactly one top bar.

### Home (hero + 7 sections → hero + 5 sections)
- Hero: removed the eyebrow and the demo line under the buttons; subline 38 → 15 words; secondary CTA "See how it works" → "How it works".
- **Removed "Outcomes"**: it restated the hero and the three sections after it.
- "Check before you send": no eyebrow, body 40 → 16 words. The diff card stays.
- "Private by default": no intro; cards 20–25 → 4–8 words; the example line and the notes pill are gone ("Notes stay home" is on the app diagram); "Who can read it" became an eye chip.
- "One list, every app": body 27 → 13 words; link "Manage app access".
- "Who keeps a TrustList": card lines 22–25 → 10–12 words.
- **FAQ moved to How it works** (6 → 4 questions, 12–15-word answers; the trust-score and lookalike questions are answered by How it works itself).
- Closing: heading + button. One divider instead of two.

### How it works
- No eyebrow; intro 38 → 11 words; section bodies one line each.
- Anatomy: part titles only (the numbered diagram shows each part); storage tiers, trust signals and check steps cut to 5–12 words.
- For developers: 50 → 18-word line; scopes and the `resolve` example sit behind a "Show the resolve API" disclosure.
- FAQ (4 questions) added here; CTA heading + button.

### App (`/app/...`)
- **One bar instead of two**: section tabs on the left, one pill on the right showing "● Sepolia testnet | Demo controls" that opens the demo controls. On phones the tabs use short labels (Contacts, Check, Apps) and the pill is icon-only, so everything fits at 390px.
- **Testnet line once per transaction**: only in the wallet prompt. Removed from the app strip, the add-contact footer (with the fee line), the vouch card and the change-visibility dialog.
- Unlock gate: removed the three bullet points; body 17 → 7 words.
- Check: intro paragraph → info icon next to the title; "Or try an example" → "Examples"; verdict reasons cut (lookalike 40 → 9 words, stranger 23 → 11); removed the diff legend; flagging no longer toasts (the verdict updates in place).
- Add a contact: removed the intro and the address/tag hints; trust-level help lines moved into an info popover (`TrustHelp`); the note hint is a short "Only you can read it" tag in the section header; visibility hints 5–10 → 4–5 words; publishing no longer toasts (the contact page shows the content ID and confirmed transaction).
- Contact page: "why vouch" moved into an info popover; trust help line → info popover; no toast on verify, vouch, trust change or visibility change (the stamp, "You vouched on…", the selected pill and the transaction status already say it); "not found" is one line + back button; delete dialog descriptions shortened.
- Connected apps: intro → info popover (which also says apps never see notes); removed the "What apps never see" panel, the request body line and the scope descriptions (the before/after preview shows them); no toast on grant or revoke.
- Demo controls: hints cut to 4–7 words.
- Empty and error states are one line plus the next action.
- New shared component: `src/components/ui/info-tip.tsx` (from the pilot; Radix Popover, works on touch).

French was rewritten to the same brevity in `src/i18n/dictionaries/fr.ts`; unused keys were removed from both dictionaries.

## 3. After

| Page | Visible before | Visible after | Change | Total after | Chrome before | Chrome after |
|-|-:|-:|-:|-:|-:|-:|
| Home | 679 | 351 | −48% | 351 | 82 | 67 |
| How it works | 653 | 322 | −51% | 443 | 82 | 67 |
| Credits | 113 | 87 | −23% | 87 | 82 | 67 |
| 404 | 33 | 15 | −55% | 15 | 82 | 67 |
| App: unlock gate | 62 | 19 | −69% | 19 | 86 | 68 |
| App: contacts | 243 | 229 | −6% | 232 | 87 | 69 |
| App: contact (Malik) | 172 | 126 | −27% | 130 | 87 | 69 |
| App: add a contact | 187 | 107 | −43% | 110 | 87 | 69 |
| App: check (lookalike verdict) | 227 | 163 | −28% | 166 | 87 | 69 |
| App: connected apps | 236 | 136 | −42% | 139 | 87 | 69 |
| **Total** | **2,605** | **1,555** | **−40%** | **1,692** | **849** | **681** |

Marketing pages alone (home, how it works, credits, 404): 1,478 → 775 visible words (−48%). The contacts page is almost all seeded data (names, roles, tags, circles), so it barely moves. About 80 of the home page's words are the hero card's sample transactions.

Dictionary copy: **EN 3,880 → 2,656 (−32%)**, FR 4,250 → 2,929 (−31%). Per section (EN): meta 190 → 179 · common 159 → 126 · home 784 → 280 · how 623 → 413 · credits 89 → 63 · app 1,526 → 1,086 · pricing 208 → 208 (internal, unlinked page, left as is) · seed 300 → 300 (sample data).

### Screenshots

- Before: `docs/screenshots/before/en-1440-light-page-home.png`, `docs/screenshots/before/en-1440-light-flow2-check-lookalike.png`.
- After: `docs/screenshots/en-1440-light-page-home.png`, `docs/screenshots/en-1440-light-flow2-check-lookalike.png`, and every other page and flow step in `docs/screenshots/` (EN 390/1440 light/dark, FR 390/1440 light). File names are unchanged.
