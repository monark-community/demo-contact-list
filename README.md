# TrustList by Monark

TrustList is **your wallet's address book**: name the people behind wallet addresses, keep your own trust level and private notes, **check any address before you send** (including lookalikes planted by address poisoning), and share the same list with the Monark apps you choose. It is Monark's Trust Contacts module, the shared contact list many apps can read.

This repository is the **interactive demo site**: a Next.js app with a fully simulated wallet and testnet, so anyone can unlock a sample list, check addresses, add and publish contacts, ask for verification, vouch, and grant or revoke app access without a real wallet or funds.

- Project documentation: https://www.monark.io/en/project/contact-list
- Site plan (product brief, flows, copy, design decisions): [`docs/site-plan.md`](docs/site-plan.md)
- Image credits: [`docs/assets.md`](docs/assets.md)

> Demo · simulated data. Testnet demo · not financial advice · no real funds. All data stays in your browser.

## What you can do in the demo

1. **Unlock your list**: sign in with the demo wallet (or reject it), watch the list decrypt, then search and filter it (people, organisations, your own wallets; trust level; tag).
2. **Check an address before you send**: paste one or pick a sample. Verdicts: safe, check first, don't send (lookalike or flagged), unknown, one of your wallets. Lookalikes show exactly which of the 40 characters differ, and you can flag them in one click.
3. **Add a contact**: the address is checked as you type (invalid, duplicate, lookalike to acknowledge, known or flagged by your circles), then name, tags, trust level, private note and visibility. Private contacts save instantly; circle and public contacts are published with a simulated transaction.
4. **Verify and vouch**: ask the owner to sign a verification (they can let it expire), then publish a public vouch.
5. **Share your list with an app**: review TaskFlow's request scope by scope with a live before/after preview, allow it, and revoke any app later.

Every on-chain step goes through a simulated wallet prompt (fee, testnet notice, confirm or reject), a pending state with a transaction hash, then confirmed or failed. Free signatures (sign-in, verification requests, app permissions) use the same prompt without a fee. **Demo controls** can make the next network step fail, slow the network down, or reset the demo.

## Run it locally

Requirements: Node.js 22 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3000 (redirects to /en or /fr)
```

Checks:

```bash
pnpm lint
pnpm typecheck    # next typegen && tsc --noEmit
pnpm build && pnpm start
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL used in metadata and the sitemap (default `https://trustlist.monark.io`).

### Screenshots

With a production server running on port 3136 (`pnpm build && pnpm start -p 3136`), `pnpm screenshots` drives every page and key flow with Playwright at 390 and 1440 px, light and dark, in English (plus French checks) and writes PNGs to `docs/screenshots/`. Set `BASE_URL` for another server, and `ONLY=en-390-light` to run one variant.

## How the simulation works

Everything lives in `src/lib/demo/`, behind a small typed layer shaped like the real thing (an encrypted local store, IPFS, an attestation contract and wallet calls), so it can be swapped for real storage and wagmi/viem without touching the UI:

| File | Role |
|-|-|
| `types.ts` | Contacts (several addresses with purposes, tags, trust level, private note, visibility, verification, vouches, interaction log), circles, circle directory, app grants, wallet and transaction state. |
| `check.ts` | The address check, pure and synchronous: not an address → one of your wallets → in your list → lookalike of a contact (same first and last 4 hex characters, compared on all 40) → known or flagged by your circles → stranger. |
| `ops.ts` | State changes applied once a step confirms: add, edit, verify, vouch, change visibility, delete, flag, grant and revoke apps. |
| `chain.ts` | `useTx()`: wallet prompt → pending (1.2–2.4 s, 3–6 s on "slow network") → confirmed, reverted, or expired for off-chain signatures. |
| `wallet.ts` | Sign-in (a free signature) followed by the list being decrypted. |
| `store.ts` | External store persisted to `localStorage` (every access in try/catch; the demo still works if storage is blocked) and the wallet-prompt channel. |
| `seed.ts`, `addresses.ts` | Localized example data: a Montréal community member's list (club treasurer, hackathon developer, sponsor, co-op café, a flagged airdrop drainer, their own wallets), two circles and three apps. Addresses are valid hex and stable across the site. |

## Project structure

```
src/
  proxy.ts                  locale redirect (/ → /en or /fr from Accept-Language)
  app/
    [locale]/               root layout (html lang, header, footer), home, 404
      app/                  demo: contacts, new, contacts/[id], check, apps
      how-it-works/  credits/  pricing/ (internal, unlinked, noindex)
      opengraph-image.tsx
    sitemap.ts  robots.ts  icon.svg  globals.css (Monark 2026 tokens)
  components/
    ui/                     shadcn/ui + @monark/ui registry (wallet, connect-wallet, network-badge, tx-status)
    site/                   Monark standard header, footer, pairing, switches
    home/  diagrams/        resolving activity card, lookalike diff, app hub
    demo/                   app screens, wallet prompt, tx feedback, chips
  i18n/                     locale config, typed EN/FR dictionaries
  lib/demo/                 simulated wallet, network and data layer
docs/                       site plan, assets, screenshots
scripts/screenshots.mjs     Playwright visual check
```

Built with Next.js (App Router, TypeScript strict), Tailwind CSS v4, shadcn/ui on the [Monark UI registry](https://ui.monark.io) and Lucide icons, following the Monark brand guidelines (cream and espresso themes, Nunito Sans, flat orange).

## Deploy to Vercel

Import the repository in Vercel and deploy with the defaults: framework Next.js, install `pnpm install`, build `pnpm build`. No `vercel.json` and no environment variables are required; the Node version comes from `engines` in `package.json`. Every page prerenders except contacts created in the browser, which render on demand as a client shell.

## License and credits

Open source by the Monark community. Photos from Unsplash (free license), credited on `/credits` and in `docs/assets.md`.
