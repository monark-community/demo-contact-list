# TrustList by Monark: site plan

Status: shipped on `develop`. This plan was written before the build and is kept in sync with the code, so it describes what ships. A simplification pass (less text, context on demand, one app bar, the current header standard) is recorded in `docs/simplification.md`.

- Product: **TrustList**, Monark's Trust Contacts module.
- Authoritative description: https://www.monark.io/en/project/contact-list
- Branding: **Monark-branded** (`true`). `lovable-migration/monark-brand-guidelines.md` is binding.
- Stack: Next.js 16 (App Router, `src/`, TypeScript strict), pnpm, Tailwind CSS v4, shadcn/ui on the Monark UI registry, `lucide-react`.

---

## 1. Product brief

**Target user.** Anyone in a Monark community who sends to, receives from or works with wallet addresses they need to recognise:

- the **treasurer** of a student blockchain association who pays the same ten people every month and gets paid by sponsors;
- a **DAO working-group lead or bounty reviewer** who needs to know which contributor is behind which address, and which addresses the group has flagged;
- a **freelancer or local business** (a designer, a café co-op) paid in stablecoins by clients they have met in person;
- **ambassadors** who meet people at meetups and hackathons and want to remember who they are.

Secondary users are **app builders** in the Monark ecosystem (Splitflow, TaskFlow, GovChain) who want to show a name instead of `0x7a3F…c19E`, and **students** learning how identity, privacy and interoperability layer on top of a wallet (the documentation's education angle).

**Core job to be done.** *"When an address appears in front of me (to pay, to approve, to review), tell me who it is, whether I trust it, and warn me if it only looks like someone I know, in every app I use, without handing my address book to a company."*

**Domain concepts** (each explained in plain words the first time the site uses it):

| Concept | Meaning in TrustList |
|-|-|
| Contact | A person, an organisation or one of **your own** wallets. It can hold several addresses, each with a purpose ("Main wallet", "Club treasury (multisig)"). |
| Label and tags | The name you give an address, plus tags such as *Developer*, *Trusted partner*, *Frequent collaborator*, *Flagged for spam*. |
| Note | Free text only you can read. Notes are never shared, published or given to apps. |
| Trust level | Your own judgement, four plain levels: **Trusted**, **Known**, **Unverified**, **Flagged**. TrustList never invents a score for you. |
| Verified by owner | The address's owner signed a message confirming the label you gave them. Proves control of the address, nothing else. |
| Vouch | A public, signed statement "I know this address" published on-chain. Members of your circles see how many people they trust vouch for an address. |
| Visibility | Where a contact lives. **Private**: encrypted on your device, only you. **Circle**: encrypted and shared with a circle (your club, your DAO). **Public**: published to IPFS (decentralised storage) and anchored on-chain, readable by anyone. |
| Circle | A group whose members share encrypted entries and warnings, e.g. *Monark Montréal* or *Campus Blockchain Club*. |
| Address check | Paste any address before you send: TrustList answers from your list, your circles, and a lookalike test. |
| Lookalike (address poisoning) | A scam address generated to share the first and last characters of someone you pay, then planted in your history with a tiny "dust" transfer so you copy it by mistake. |
| Connected app | An app you allowed to read part of your list (names, trust and tags, warnings). Revocable at any time. |
| Interaction log | Timestamped history with a contact: payments, verifications, vouches, app events. |

**What the Lovable version got wrong or left out.**

- A purple-to-blue gradient landing page with frosted cards, a fake "Join thousands of Web3 professionals" claim and footer links to pages that don't exist. Nothing Monark about it.
- A 1–10 "trust score" and a "suggested trust level" computed from tag counts: it looks scientific and means nothing. We replace it with four honest levels you choose, plus two *verifiable* signals (owner verification, vouches).
- It claimed "Privacy first" but had no privacy model: no idea of where data lives, who can read it, or what is published. The documentation's core idea (encrypted off-chain *or* public on decentralised storage) was missing.
- The documentation's defining feature, **one contact list shared by many apps**, was absent.
- No verification status, endorsements, own-address log or timestamped interaction log, all named in the documentation.
- Mock addresses were not valid hex (`0x8ba1f…Hac136c9331q8c4c`), edits never persisted, the wallet "connected" instantly, there were no pending or failed states, and it was English only.
- Nothing helped at the moment that matters: pasting an address to send money. Address poisoning, the most common way people lose funds to a "familiar" address, was not addressed at all.

## 2. Value proposition

**TrustList gives Monark community members one wallet-owned address book that names the people behind addresses, warns you before you pay a stranger or a lookalike, and follows you into every Monark app, instead of a spreadsheet of `0x` strings you re-check by hand in each app.**

Supporting benefits, as outcomes:

1. **You stop sending to the wrong address.** Every address is checked against your list and your circles, and lookalikes are caught before you copy them.
2. **You know who you are dealing with.** A name, your own note and trust level, plus proof the owner confirmed it and how many people you trust vouch for it.
3. **You set it up once and it works everywhere.** Splitflow, TaskFlow and GovChain show your names instead of raw addresses, only with your permission, and your notes never leave your device.

## 3. Hero

- **Headline** (6 words): *Know who's behind every address.*
  FR: *Sachez qui se cache derrière chaque adresse.*
- **Subheadline:** *Your wallet's address book: name who you pay, and check any address before you send.*
  FR: *Le carnet d'adresses de votre portefeuille : nommez qui vous payez et vérifiez chaque adresse avant d'envoyer.*
- **Primary CTA:** "Launch the demo" / « Lancer la démo » → `/{locale}/app`.
- **Secondary CTA:** "How it works" / « Fonctionnement » → `/{locale}/how-it-works`.
- **Visual:** a **live wallet-activity card built in code**. Five raw transactions (`0x7a3F…c19E sent you 250 tUSDC`, …) resolve one by one into names with trust chips (*Inès Roy · Trusted · Verified*), and one row, a 0 tETH "dust" transfer from `0x7a3F…c19E`'s lookalike, turns into a red *Lookalike of Inès Roy* warning. It loops calmly. Product UI rather than a photo because the product's whole idea is that moment: a string becomes a person, and a trap becomes visible. The mesh butterfly sits large and cropped behind it (see §8).

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`). `/` and any locale-less path redirect to the visitor's preferred language (fallback English) in `src/proxy.ts`.

| Route | Purpose | Sections, in order |
|-|-|-|
| `/{locale}` | Home: explain TrustList in 30 seconds and send people into the demo. | Hero with resolving activity card · "Check before you send" (lookalike diff) · "Private by default" (three visibility levels) · "One list, every app" (hub diagram) · Who keeps a TrustList (3 photo cards with a sample contact each) · Closing call to action |
| `/{locale}/app` | The demo: your contacts. | Unlock gate (when disconnected) · App bar (tabs Contacts, Check an address, Connected apps + the network/demo-controls pill) · Search, kind chips (All, People, Organisations, My addresses), trust filter, tag filter · Contact list · Side rail: quick check, circles, demo controls |
| `/{locale}/app/new` | Add a contact. | Address first (live validation, duplicate and lookalike check) · Who it is (kind, name, role, address purpose) · Tags · Trust level · Private note · Visibility (private, circle, public) · Save |
| `/{locale}/app/contacts/[id]` | One contact. | Header (name, role, trust, verification) · Addresses with purposes and copy · Trust signals (your level, verified by owner, vouches) · Tags and private note (inline edit) · Visibility · Interaction log · Danger zone (delete) |
| `/{locale}/app/check` | The address check. | Title with info popover · Paste box + example chips · Scan animation · Verdict card with a one-line reason and next actions |
| `/{locale}/app/apps` | Connected apps and permissions. | Pending request (TaskFlow) with scope review and live before/after preview · Connected apps (Splitflow, GovChain) with scopes and revoke · "What apps never see" in the title's info popover |
| `/{locale}/how-it-works` | For students, developers and careful users: the mechanics. Justified because the documentation frames TrustList as a way to learn identity layering, privacy models and interoperability, and because the "shared by many apps" promise needs a developer-facing explanation. | Anatomy of a contact · Where your list lives (three tiers diagram) · Trust signals, and why there is no score · How the address check decides · For developers (one line; scopes and resolve API behind a disclosure) · FAQ (4 questions) · Call to action |
| `/{locale}/credits` | Photo, type and icon credits (required by the asset rules). | Photos · Type and icons · Monark brand assets |
| `/{locale}/pricing` | **Internal strategy review only.** Never linked, excluded from the sitemap, `noindex, nofollow`. | "Free, part of Monark" card · What costs anything (gas for public entries only) · Partner circles · Reasoning |
| 404 | Friendly not-found with the vertical Monark logo, links home and to the demo. | |

**Header** (brand guidelines §2 and §10): butterfly mark 28px + "TrustList" (Nunito Sans 800, 18px) on one line → home, no "by Monark" · links *Overview*, *How it works*, *Demo* left-aligned after the brand (active page in foreground) · right side: Demo chip (primary 8% light / 15% dark, primary-ink text) → EN/FR pill → 36px theme toggle → primary action *Launch demo* (inside `/app`, the `connect-wallet` component). Below `lg`: brand + menu button; the full-height sheet holds the links, Demo chip, EN/FR, theme and action. Marketing pages have exactly one top bar.

**App bar** (inside `/app` only): one compact bar under the header with the section tabs on the left and one pill on the right ("● Sepolia testnet | Demo controls") that opens the demo controls. Phones: short tab labels, icon-only pill.

**Footer** (three bands): product line (13 words) and links (Overview, How it works, Demo, Credits) · "TrustList is built by Monark" / « TrustList est conçu par Monark », Monark logo and tagline, links to the project page on monark.io and the GitHub repo, social icons · "© {year} Monark · Open source", "Demo · simulated data", credits link.

## 5. Feature highlights

| Feature | User benefit | Where it appears | Proven by flow |
|-|-|-|-|
| Address check with lookalike detection | Never pay a poisoned or unknown address by mistake | Home "Check before you send"; `/app/check`; add-contact form; `/how-it-works` | Flow 2 |
| Contacts with purposes, tags, notes and four trust levels | Recognise every address and remember why | Home hero; `/app`; contact page | Flows 1, 3 |
| Three visibility levels (private, circle, public) | Keep your book private, share warnings with your group, publish what should be public | Home "Private by default"; add-contact form; `/how-it-works` | Flow 3 |
| Owner verification and public vouches | Proof, not guesswork, that an address belongs to who you think | Contact page; `/how-it-works` | Flow 4 |
| One list shared with apps, per-scope permissions | Names everywhere, set up once, revocable | Home "One list, every app"; `/app/apps`; `/how-it-works` developers section | Flow 5 |
| Interaction log and own-address book | Timestamped history with each contact; your own wallets labelled by purpose | Contact page; "My addresses" filter | Flows 1, 4 |

## 6. Key flows

Anything that writes on-chain (publishing, vouching, unpublishing, deleting a published entry) goes through a simulated wallet prompt (summary, estimated network fee, the testnet disclaimer, which appears nowhere else in the app, *Confirm* / *Reject*), then a pending state with a transaction hash (1.2–2.4 s, 3–6 s with "slow network"), then confirmed or failed. Signatures that cost nothing (sign-in, verification requests, app permissions) use the same prompt without a fee. The demo controls can make the next network step fail; rejecting in the prompt always produces a "rejected" failure.

1. **Unlock your list.** `/app` → *Connect demo wallet* → prompt "Sign in to TrustList" (explains that the signature derives the key that decrypts your private contacts; no fee) → *pending*: "Waiting for your signature…", then "Decrypting your list…" with skeleton rows → *confirmed*: contact list, header shows the `connect-wallet` chip (`0x…` + Jazzicon). *Failed*: rejecting shows "You declined the sign-in. Nothing was shared." with *Try again*.
2. **Check an address before you send.** `/app/check` (or the quick check in the rail) → paste an address or pick a sample (*Inès's main wallet*, *A lookalike*, *Known to your circle*, *Flagged by your circle*, *A stranger*, *One of your wallets*, *Not an address*) → *pending*: "Checking your list, your circles and lookalikes…" with the address scanned group by group → *confirmed* verdicts: **Safe** (in your list, trusted/verified), **Caution** (unknown to you but vouched by your circle; or in your list but only unverified), **Danger** (lookalike of a contact, with the differing characters highlighted; or flagged), **Unknown** (a stranger: "send a small test amount first or ask them to verify"), **Yours** (one of your own wallets). Next actions: *Add to contacts*, *Open contact*, *Flag this address*. *Failed*: with "fail next" on, the circle lookup fails: "We couldn't reach your circles. This answer uses your own list only." with *Check again*. Invalid input: "Not a wallet address" + "Addresses are 0x followed by 40 characters (0–9, a–f)." Flagging needs no toast: the verdict re-evaluates in place ("You flagged …").
3. **Add a contact.** `/app/new` → paste the address → live check (invalid, "Already in your list as …" with a link, or a lookalike warning that must be acknowledged) → kind, name, role, address purpose → tags (pick or create) → trust level → private note → visibility. **Private**: *Save contact* → "Encrypting on this device…" → *confirmed*: redirect to the contact, toast "Saved and encrypted". **Circle or Public**: *Save and publish* → wallet prompt with fee → *pending*: "Publishing to IPFS and anchoring on-chain…" with hash → *confirmed*: redirect to the contact, which shows its content ID (CID); no toast. *Failed*: "Publishing failed. Your contact wasn't saved; the form is still here." with *Try again*. Validation errors: missing name, invalid address, duplicate.
4. **Verify and vouch.** Contact page for *Malik Haddad* (Known, unverified) → *Ask Malik to verify* → prompt (sign a request, no fee) → *pending*: "Waiting for Malik to sign (simulated)…" → *confirmed*: a "Verified by owner" stamp with date, log entry (no toast). *Failed*: "Malik's wallet didn't sign. The request expired and nothing changed." Then *Vouch publicly* → prompt with fee → *pending* → *confirmed*: vouch count +1 and "You vouched on {date}" with the confirmed hash (no toast). *Failed*: "Your vouch wasn't published. Nothing changed." with *Try again*. Changing trust level, tags and notes saves instantly on the device (no signature: the key was derived at sign-in).
5. **Share your list with an app.** `/app/apps` → *TaskFlow wants to read your contacts* → review scopes (Names and address labels ✓, Trust levels and tags ✓, Warnings about flagged addresses ✓; Private notes: never shared) → live preview of a TaskFlow bounty board before/after → *Allow access* → prompt (no fee) → *pending* → *confirmed*: TaskFlow listed as connected, preview names resolve. *Failed*: "You declined. TaskFlow still sees raw addresses." *Revoke* on any app → prompt → *pending* → revoked, preview returns to raw addresses.

Always available: *Demo controls* (fail the next network step, slow network, reset demo) and a visible *Reset demo* action.

## 7. Content (EN / FR)

The shipped copy lives in `src/i18n/dictionaries/en.ts` and `fr.ts` (typed: French must satisfy the English shape). Tone: the guidelines' voice (open, practical, community-first, no hype), with Web3 terms explained on first use. The drafts below are the source for those files.

### Home

| Slot | English | Français |
|-|-|-|
| H1 | Know who's behind every address. | Sachez qui se cache derrière chaque adresse. |
| Sub | Your wallet's address book: name who you pay, and check any address before you send. | Le carnet d'adresses de votre portefeuille : nommez qui vous payez et vérifiez chaque adresse avant d'envoyer. |
| CTAs | Launch the demo · How it works | Lancer la démo · Fonctionnement |
| Hero card title | Recent activity | Activité récente |
| Check H2 + line | Check before you send · Scammers copy the first and last characters of addresses you pay. TrustList compares all 40. | Vérifiez avant d'envoyer · Les fraudeurs copient le début et la fin des adresses que vous payez. TrustList compare les 40 caractères. |
| Check CTA | Try the address check | Essayer la vérification |
| Privacy H2 | Private by default, public when you choose | Privé par défaut, public quand vous le choisissez |
| Levels | **Private** Encrypted on your device. (You) · **Circle** Shared, encrypted, with your club or DAO. (Your circle) · **Public** Published on-chain, for official addresses. (Anyone) | **Privé** Chiffré sur votre appareil. (Vous) · **Cercle** Partagé et chiffré avec votre club ou votre DAO. (Votre cercle) · **Public** Publié on-chain, pour les adresses officielles. (Tout le monde) |
| Apps H2 + line | One list, every Monark app · Apps show your names instead of raw addresses, only with your permission. | Une seule liste, toutes les applis Monark · Les applis affichent vos noms au lieu d'adresses brutes, seulement avec votre permission. |
| Who H2 | Who keeps a TrustList | Qui tient une TrustList |
| Cards | **Student associations** Know the club's multisig from the sponsor's, and share scam warnings. · **DAO working groups** See who submitted a bounty, and who vouches for them. · **Freelancers and local shops** Recognise clients months later, with every payment logged. | **Associations étudiantes** Distinguez le multisig du club de l'adresse du commanditaire, et partagez les alertes. · **Groupes de travail de DAO** Voyez qui a soumis une prime, et qui s'en porte garant. · **Pigistes et commerces locaux** Reconnaissez vos clients des mois plus tard, chaque paiement noté. |
| Closing | Your list, your rules. · Launch the demo | Votre liste, vos règles. · Lancer la démo |

**FAQ (EN / FR)**, on How it works only, four questions:

1. *Who can see my contacts?* Only you, unless you put a contact in a circle or make it public. / *Qui peut voir mes contacts ?* Vous seul, sauf si vous placez un contact dans un cercle ou le rendez public.
2. *What do apps see?* Only the scopes you allow. Never your notes. Revoke access at any time. / *Que voient les applis ?* Seulement les portées autorisées. Jamais vos notes. Révocable à tout moment.
3. *Does it cost anything?* Private and circle contacts are free. Public entries and vouches pay a network fee. / *Est-ce payant ?* Les contacts privés et de cercle sont gratuits. Les entrées publiques et les garanties paient des frais de réseau.
4. *Is this a real product?* It's a working demo of Monark's Trust Contacts module. No real funds are involved. / *Est-ce un vrai produit ?* C'est une démo fonctionnelle du module Contacts de confiance de Monark. Aucuns fonds réels.

### App: key strings

| Slot | English | Français |
|-|-|-|
| Gate | Unlock your contact list · Sign in to decrypt it on this device. · Connect demo wallet | Déverrouillez votre liste de contacts · Connectez-vous pour la déchiffrer sur cet appareil. · Connecter le portefeuille de démo |
| Gate rejected | You declined the sign-in. Nothing was shared. | Vous avez refusé la connexion. Rien n'a été partagé. |
| Decrypting | Decrypting your list… | Déchiffrement de votre liste… |
| Tabs (phones) | Contacts · Check an address · Connected apps (Contacts · Check · Apps) | Contacts · Vérifier une adresse · Applis connectées (Contacts · Vérifier · Applis) |
| List H1 | Your contacts | Vos contacts |
| Search | Search names, tags, notes or addresses | Rechercher un nom, une étiquette, une note ou une adresse |
| Kind chips | All · People · Organisations · My addresses | Tous · Personnes · Organisations · Mes adresses |
| Trust levels | Trusted · Known · Unverified · Flagged | De confiance · Connu · Non vérifié · Signalé |
| Visibility | Private · Circle · Public | Privé · Cercle · Public |
| Empty search | No contact matches "{q}". + *Clear filters* | Aucun contact ne correspond à « {q} ». + *Effacer les filtres* |
| Empty list | Your list is empty. + *Add contact* | Votre liste est vide. + *Ajouter un contact* |
| Add | Add contact | Ajouter un contact |
| Check verdicts | Safe to send · Check first · Don't send · Unknown address · One of your wallets | Envoi sûr · À vérifier · N'envoyez pas · Adresse inconnue · Un de vos portefeuilles |
| Lookalike | It imitates {name}'s {purpose}: likely address poisoning. (+ the diff and "{n} of 40 characters differ") | Elle imite l'adresse de {name} ({purpose}) : sans doute un empoisonnement d'adresse. |
| Circle down | We couldn't reach your circles. This answer uses your own list only. | Impossible de joindre vos cercles. Cette réponse ne tient compte que de votre liste. |
| Tx | Confirm in your wallet · Waiting for the network… · Confirmed · Failed · You rejected the request in your wallet. · The transaction failed on the network. Nothing changed. · Try again | Confirmez dans votre portefeuille · En attente du réseau… · Confirmée · Échec · Vous avez refusé la demande dans votre portefeuille. · La transaction a échoué sur le réseau. Rien n'a changé. · Réessayer |
| Disclaimer (wallet prompt only) | Testnet demo · not financial advice · no real funds | Démo sur testnet · pas un conseil financier · aucuns fonds réels |
| Demo chip (header) · footer notice | Demo · Demo · simulated data | Démo · Démo · données simulées |
| Info popovers | Check an address, Connected apps, Trust level, Vouches | Vérifier une adresse, Applis connectées, Niveau de confiance, Garanties |

The complete list (form validation, demo controls, contact page, apps page, how-it-works and credits copy) is in the dictionaries.

## 8. Aesthetics (within the Monark guidelines)

Colour, type, logo, header and footer are fixed by the guidelines: cream / espresso tokens derived from `#f88d10` with `--surface-tint: 1` (the §3 token block pasted over the registry base theme), Nunito Sans 400/600/700/800, pill actions, 1rem cards, borders not shadows, flat orange only, one primary action per view.

- **Layout and rhythm.** Home alternates statement bands and dense bands: asymmetric hero (copy left, activity card right; stacked on mobile) → "Check before you send" (a wide band: one line left, the lookalike diff right) → visibility levels (three short cards with a "who can read it" chip) → the app hub diagram (centred, on a muted band) → photo cards → closing band. The branded section divider appears once. The app is a working tool: a dense list with a right rail on desktop, single column on mobile, 44px touch targets, addresses always monospace and shortened with the full value on copy.
- **Hero visual.** The resolving activity card (§3).
- **Mesh butterfly.** Once, on the home hero, large, cropped off the right edge at low opacity behind the activity card. Nowhere else.
- **Illustrations.** No reused Monark decorative illustrations beyond the mesh butterfly. New flat orange line art drawn in code: the **app hub** (your list in the centre, lines out to Splitflow, TaskFlow and GovChain, with a scope chip on each line and a padlock on the notes that stay home), the **three storage tiers** (device, circle, IPFS + chain), the **check decision path** on `/how-it-works`, and the **contact anatomy**.
- **Photography direction.** Warm, natural-light, unstaged photos of people who would keep a TrustList: students on a campus plaza, a working group around a table, a freelancer in her studio. Same warm grade, used only in the "who keeps a TrustList" section, each paired with a sample contact row in real UI.
- **Signature moments.**
  1. **Names resolving.** In the hero, and on the apps page when you grant a permission, raw addresses cross-fade into names with trust chips, one row at a time (180 ms apart).
  2. **The lookalike diff.** The address check scans the pasted address in groups of four characters against your contacts; matching groups settle into muted text, differing characters light up with a red underline, and the verdict lands with the count ("32 of 40 characters differ").
  3. **The owner's stamp.** When a verification confirms, a "Verified by owner" seal stamps onto the contact header (200 ms scale-in) and the interaction log gains its entry.
- All motion 150–250 ms ease-out except the explanatory hero loop; everything honours `prefers-reduced-motion` (final states render immediately).

## 9. Assets

| Asset | Purpose | Placement |
|-|-|-|
| `public/images/campus.jpg` (Unsplash, Dennis Zhang) | Student association use case | Home "who keeps a TrustList" |
| `public/images/working-group.jpg` (Unsplash, Andreea Avramescu) | DAO working group use case | Home "who keeps a TrustList" |
| `public/images/studio.jpg` (Unsplash, Vitaly Gariev) | Freelancer / local business use case | Home "who keeps a TrustList" |
| `public/brand/*` Monark logos (standalone, horizontal light/dark, vertical light/dark) | Header brand, footer, 404, favicon, wallet prompt, unlock gate | Shell |
| `public/brand/monark-mesh.svg` | Home hero decoration | Home hero only |
| `public/brand/socials/*.svg` | Footer social icons | Footer |
| Open Graph image | Generated with `next/og` per locale | Metadata |

Icons: Lucide only. Diagrams: built in JSX/SVG (resolving card, lookalike diff, app hub, storage tiers, check path, contact anatomy). Full credits in `docs/assets.md` and on `/credits`.

## 10. Pricing strategy

TrustList is **free, included in the Monark bundle**, confirming the default. Reasons: it is shared infrastructure (the FAQ's Trust Contacts module) whose value grows with the number of people and apps using the same list, so any per-user price would work against adoption; a trust tool that charges per lookup invites the suspicion it is meant to remove; and it is open source. Private and circle contacts cost nothing; publishing a public contact or a vouch costs only the network fee. Organisations that want a managed circle directory (onboarding members, curated scam lists, official address publishing) are served through Monark's partnership programme rather than a price list.

A designed `/{locale}/pricing` page exists **for internal review only**: not linked anywhere, excluded from `sitemap.xml`, `robots: { index: false, follow: false }`. No other page mentions prices.

## 11. Out of scope

- Real wallets, chains, signing, encryption, IPFS or indexing (no wagmi/viem; `src/lib/demo/` is shaped so they could be swapped in).
- ENS or other name services, cross-device sync, import/export of address books, multi-chain address formats (EVM `0x` addresses only).
- Messaging between contacts, circle administration (creating circles, inviting members), and moderation of circle warnings.
- Any computed reputation score: by design, TrustList shows judgements and verifiable facts, not a number.
- A `/brand` page, a blog, or any backend.

## 12. Implementation notes (as shipped)

- `theme-2026.json` is not published on ui.monark.io, so `theme.json` was installed and the guidelines' §3 token block pasted over it in `src/app/globals.css`, plus muted `--success` / `--warning` status colours (always paired with an icon and a text label).
- The raw `@monark/ui` registry files import `radix-ui` without declaring it and ship square buttons; the registry components were installed, then aligned with the Monark 2026 look (pills, localizable close and copy labels) using the same adaptations as the Splitflow demo. `connect-wallet`'s bare `wallet` dependency doesn't resolve through the shadcn CLI, so its source was copied from the registry JSON.
- Dependencies beyond the stack: `next-themes` (theme toggle without a flash), `sonner` (toasts), `react-jazzicon` (required by the registry `wallet`); `playwright` as a dev dependency for `pnpm screenshots`. No recharts: there are no charts.
- Contact pages for the seeded examples are prerendered; contacts created in the browser render on demand as a client shell reading local demo state.
- Toasts sit top-right under the header and app bar on desktop and under the header on phones; page titles, verdicts and contact headers are left-aligned, so they never cover what they report on. A toast only appears when nothing on screen confirms the result (private save, details saved, delete, copy, demo reset).
- Context on demand uses `src/components/ui/info-tip.tsx` (Radix Popover behind an info icon; opens on tap, so it works on touch).
- Header shell: `src/components/site/brand.tsx`, `demo-chip.tsx`, `header.tsx`, `nav-links.tsx`, `mobile-menu.tsx`, `locale-switch.tsx`, `theme.tsx`, `footer.tsx`, mirroring Splitflow's reference implementation.
- Seeded examples are created in the visitor's language on first load and on "Reset demo" (they are the user's own data afterwards). The FAQ and the developer disclosure on How it works use native `<details>`.
- Screenshots in `docs/screenshots/` are taken with reduced motion, so animations appear in their settled state: every page and flow at 390 and 1440 px, light and dark, in English; home, how-it-works, contacts, the lookalike check, verification, the add-contact lookalike warning and the apps request in French.
