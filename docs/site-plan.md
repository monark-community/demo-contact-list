# TrustList by Monark: site plan

Status: shipped on `develop`. This plan was written before the build and is kept in sync with the code, so it describes what ships.

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
- **Subheadline:** *TrustList is your wallet's address book: name the people you work with, check any address before you send, and carry the same list into every Monark app. Private by default, shared only when you choose.*
  FR: *TrustList, c'est le carnet d'adresses de votre portefeuille : nommez les personnes avec qui vous travaillez, vérifiez une adresse avant d'envoyer et retrouvez la même liste dans toutes les applis Monark. Privé par défaut, partagé seulement quand vous le décidez.*
- **Primary CTA:** "Launch the demo" / « Lancer la démo » → `/{locale}/app`.
- **Secondary CTA:** "See how it works" / « Voir le fonctionnement » → `/{locale}/how-it-works`.
- **Visual:** a **live wallet-activity card built in code**. Five raw transactions (`0x7a3F…c19E sent you 250 tUSDC`, …) resolve one by one into names with trust chips (*Inès Roy · Trusted · Verified*), and one row, a 0 tETH "dust" transfer from `0x7a3F…c19E`'s lookalike, turns into a red *Lookalike of Inès Roy* warning. It loops calmly. Product UI rather than a photo because the product's whole idea is that moment: a string becomes a person, and a trap becomes visible. The mesh butterfly sits large and cropped behind it (see §8).

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`). `/` and any locale-less path redirect to the visitor's preferred language (fallback English) in `src/proxy.ts`.

| Route | Purpose | Sections, in order |
|-|-|-|
| `/{locale}` | Home: explain TrustList in 30 seconds and send people into the demo. | Hero with resolving activity card · Three outcomes · "Check before you send" (lookalike diff explainer) · "Private by default" (three visibility levels) · "One list, every app" (hub diagram) · Who uses TrustList (3 photo cards with a sample contact each) · FAQ · Closing call to action |
| `/{locale}/app` | The demo: your contacts. | Unlock gate (when disconnected) · App tabs (Contacts, Check an address, Connected apps) · Search, kind chips (All, People, Organisations, My addresses), trust filter, tag filter · Contact list · Side rail: quick check, circles, demo controls |
| `/{locale}/app/new` | Add a contact. | Address first (live validation, duplicate and lookalike check) · Who it is (kind, name, role, address purpose) · Tags · Trust level · Private note · Visibility (private, circle, public) · Save |
| `/{locale}/app/contacts/[id]` | One contact. | Header (name, role, trust, verification) · Addresses with purposes and copy · Trust signals (your level, verified by owner, vouches) · Tags and private note (inline edit) · Visibility · Interaction log · Danger zone (delete) |
| `/{locale}/app/check` | The address check. | Paste box + sample chips · Scan animation · Verdict card with explanation and next actions |
| `/{locale}/app/apps` | Connected apps and permissions. | Pending request (TaskFlow) with scope review and live before/after preview · Connected apps (Splitflow, GovChain) with scopes and revoke · "What apps never see" |
| `/{locale}/how-it-works` | For students, developers and careful users: the mechanics. Justified because the documentation frames TrustList as a way to learn identity layering, privacy models and interoperability, and because the "shared by many apps" promise needs a developer-facing explanation. | Anatomy of a contact · Where your list lives (three tiers diagram) · Trust signals, and why there is no score · How the address check decides · For developers (resolve API and permission scopes, how the demo's data layer mirrors it) · Call to action |
| `/{locale}/credits` | Photo, type and icon credits (required by the asset rules). | Photos · Type and icons · Monark brand assets |
| `/{locale}/pricing` | **Internal strategy review only.** Never linked, excluded from the sitemap, `noindex, nofollow`. | "Free, part of Monark" card · What costs anything (gas for public entries only) · Partner circles · Reasoning |
| 404 | Friendly not-found with the vertical Monark logo, links home and to the demo. | |

**Header** (standard Monark shell): "TrustList by Monark" pairing → home · links *Overview*, *How it works*, *Demo* (pill highlight on the active one) · EN/FR switch · theme toggle · primary pill *Launch demo*. Inside `/app` the primary action becomes the `connect-wallet` component and a "Demo · simulated data" badge appears. Mobile: pairing + menu button opening a full-height sheet.

**Footer** (three bands): product line and links (Overview, How it works, Demo, Credits) · Monark logo and tagline, links to the project page on monark.io and the GitHub repo, social icons · "© {year} Monark · Open source", "Demo · simulated data", testnet notice, credits link.

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

Anything that writes on-chain (publishing, vouching, unpublishing, deleting a published entry) goes through a simulated wallet prompt (summary, estimated network fee, testnet disclaimer, *Confirm* / *Reject*), then a pending state with a transaction hash (1.2–2.4 s, 3–6 s with "slow network"), then confirmed or failed. Signatures that cost nothing (sign-in, verification requests, app permissions) use the same prompt without a fee. The demo controls can make the next network step fail; rejecting in the prompt always produces a "rejected" failure.

1. **Unlock your list.** `/app` → *Connect demo wallet* → prompt "Sign in to TrustList" (explains that the signature derives the key that decrypts your private contacts; no fee) → *pending*: "Waiting for your signature…", then "Decrypting your list…" with skeleton rows → *confirmed*: contact list, header shows the `connect-wallet` chip (`0x…` + Jazzicon). *Failed*: rejecting shows "You declined the sign-in. Your list stays locked and nothing was shared." with *Try again*.
2. **Check an address before you send.** `/app/check` (or the quick check in the rail) → paste an address or pick a sample (*Inès's main wallet*, *A lookalike*, *Known to your circle*, *Flagged by your circle*, *A stranger*, *One of your wallets*, *Not an address*) → *pending*: "Checking your list, your circles and lookalikes…" with the address scanned group by group → *confirmed* verdicts: **Safe** (in your list, trusted/verified), **Caution** (unknown to you but vouched by your circle; or in your list but only unverified), **Danger** (lookalike of a contact, with the differing characters highlighted; or flagged), **Unknown** (a stranger: "send a small test amount first or ask them to verify"), **Yours** (one of your own wallets). Next actions: *Add to contacts*, *Open contact*, *Flag this address*. *Failed*: with "fail next" on, the circle lookup fails: "We couldn't reach your circles. This answer uses your own list only." with *Check again*. Invalid input: "That isn't a wallet address. Addresses start with 0x followed by 40 characters (0–9, a–f)."
3. **Add a contact.** `/app/new` → paste the address → live check (invalid, "Already in your list as …" with a link, or a lookalike warning that must be acknowledged) → kind, name, role, address purpose → tags (pick or create) → trust level → private note → visibility. **Private**: *Save contact* → "Encrypting on this device…" → *confirmed*: redirect to the contact, toast "Saved and encrypted". **Circle or Public**: *Save and publish* → wallet prompt with fee → *pending*: "Publishing to IPFS and anchoring on-chain…" with hash → *confirmed*: contact shows its content ID (CID). *Failed*: "Publishing failed on the network. Your contact was not saved; your form is still here." with *Try again*. Validation errors: missing name, invalid address, duplicate.
4. **Verify and vouch.** Contact page for *Malik Haddad* (Known, unverified) → *Ask Malik to verify* → prompt (sign a request, no fee) → *pending*: "Waiting for Malik to sign (simulated)…" → *confirmed*: a "Verified by owner" stamp with date, log entry. *Failed*: "Malik's wallet didn't sign. The request expired and nothing changed." Then *Vouch publicly* → prompt with fee → *pending* → *confirmed*: vouch count +1 and "Your vouch is public" with hash. *Failed*: "Your vouch wasn't published. Nothing changed." with *Try again*. Changing trust level, tags and notes saves instantly on the device (no signature: the key was derived at sign-in).
5. **Share your list with an app.** `/app/apps` → *TaskFlow wants to read your contacts* → review scopes (Names and address labels ✓, Trust levels and tags ✓, Warnings about flagged addresses ✓; Private notes: never shared) → live preview of a TaskFlow bounty board before/after → *Allow access* → prompt (no fee) → *pending* → *confirmed*: TaskFlow listed as connected, preview names resolve. *Failed*: "You declined. TaskFlow still sees raw addresses." *Revoke* on any app → prompt → *pending* → revoked, preview returns to raw addresses.

Always available: *Demo controls* (fail the next network step, slow network, reset demo) and a visible *Reset demo* action.

## 7. Content (EN / FR)

The shipped copy lives in `src/i18n/dictionaries/en.ts` and `fr.ts` (typed: French must satisfy the English shape). Tone: the guidelines' voice (open, practical, community-first, no hype), with Web3 terms explained on first use. The drafts below are the source for those files.

### Home

| Slot | English | Français |
|-|-|-|
| Eyebrow | Trust Contacts module · Monark | Module Contacts de confiance · Monark |
| H1 | Know who's behind every address. | Sachez qui se cache derrière chaque adresse. |
| Sub | TrustList is your wallet's address book: name the people you work with, check any address before you send, and carry the same list into every Monark app. Private by default, shared only when you choose. | TrustList, c'est le carnet d'adresses de votre portefeuille : nommez les personnes avec qui vous travaillez, vérifiez une adresse avant d'envoyer et retrouvez la même liste dans toutes les applis Monark. Privé par défaut, partagé seulement quand vous le décidez. |
| CTAs | Launch the demo · See how it works | Lancer la démo · Voir le fonctionnement |
| Hero card title | Recent activity | Activité récente |
| Hero card states | Resolving names… · 4 named · 1 warning | Identification… · 4 identifiées · 1 alerte |
| Outcomes H2 | A wallet address is not a name. Now it can be. | Une adresse n'est pas un nom. Maintenant, si. |
| Outcome 1 | **Stop sending to the wrong address.** Every address is checked against your list and your circles, and lookalikes are caught before you copy them. | **Fini les envois à la mauvaise adresse.** Chaque adresse est comparée à votre liste et à vos cercles, et les imitations sont repérées avant que vous les copiiez. |
| Outcome 2 | **Know who you're dealing with.** A name, your own note and trust level, plus proof the owner confirmed it and how many people you trust vouch for it. | **Sachez à qui vous avez affaire.** Un nom, votre note et votre niveau de confiance, avec la preuve que le propriétaire l'a confirmé et le nombre de personnes de confiance qui s'en portent garantes. |
| Outcome 3 | **Set it up once, use it everywhere.** Splitflow, TaskFlow and GovChain show your names instead of raw addresses, only with your permission. | **Configurez une fois, profitez-en partout.** Splitflow, TaskFlow et GovChain affichent vos noms plutôt que des adresses brutes, seulement avec votre permission. |
| Check H2 | Check before you send | Vérifiez avant d'envoyer |
| Check body | Scammers generate addresses that start and end like someone you pay, then send you a tiny "dust" transfer so the fake shows up in your history. Most people only compare the first and last few characters. TrustList compares all 40. | Des fraudeurs génèrent des adresses qui commencent et finissent comme celle d'une personne que vous payez, puis vous envoient un montant infime pour que la fausse apparaisse dans votre historique. On ne compare souvent que les premiers et derniers caractères. TrustList compare les 40. |
| Check labels | In your list: Inès Roy · Appeared in your history yesterday · 32 of 40 characters differ | Dans votre liste : Inès Roy · Apparue hier dans votre historique · 32 caractères sur 40 diffèrent |
| Check CTA | Try the address check | Essayer la vérification |
| Privacy H2 | Private by default, public when you choose | Privé par défaut, public quand vous le choisissez |
| Private | **Private.** Encrypted on your device with a key only your wallet can derive. Only you can read it. | **Privé.** Chiffré sur votre appareil avec une clé que seul votre portefeuille peut générer. Vous seul pouvez le lire. |
| Circle | **Circle.** Encrypted and shared with a group you belong to, like your club or your DAO. Ideal for warnings about scam addresses. | **Cercle.** Chiffré et partagé avec un groupe dont vous faites partie, comme votre club ou votre DAO. Idéal pour signaler les adresses frauduleuses. |
| Public | **Public.** Published to IPFS, a decentralised storage network, and anchored on-chain. Anyone can read it: good for an organisation's official addresses. | **Public.** Publié sur IPFS, un réseau de stockage décentralisé, et ancré on-chain. Tout le monde peut le lire : parfait pour les adresses officielles d'une organisation. |
| Notes line | Your notes are never shared, published or given to apps. | Vos notes ne sont jamais partagées, publiées ni transmises aux applis. |
| Apps H2 | One list, every Monark app | Une seule liste, toutes les applis Monark |
| Apps body | Give an app permission once and it shows your names, trust levels and warnings instead of raw addresses. Change your mind and revoke it in one click. | Donnez la permission une fois et l'appli affiche vos noms, niveaux de confiance et alertes au lieu d'adresses brutes. Vous changez d'avis ? Révoquez-la en un clic. |
| Who H2 | Who keeps a TrustList | Qui tient une TrustList |
| Card 1 | **Student associations.** The treasurer knows which address is the club's multisig and which is the sponsor's, and the whole club shares its scam warnings. | **Associations étudiantes.** La trésorerie sait quelle adresse est le multisig du club et laquelle est celle du commanditaire, et tout le club partage ses alertes. |
| Card 2 | **DAO working groups.** Reviewers see who submitted a bounty, whether the address was verified by its owner, and who in the group vouches for it. | **Groupes de travail de DAO.** Les responsables voient qui a soumis une prime, si l'adresse est vérifiée par son propriétaire et qui dans le groupe s'en porte garant. |
| Card 3 | **Freelancers and local shops.** Clients met in person stay recognisable months later, with a note on the project and every payment in the log. | **Pigistes et commerces locaux.** Les clients rencontrés en personne restent reconnaissables des mois plus tard, avec une note sur le projet et chaque paiement dans l'historique. |
| FAQ H2 | Questions | Questions fréquentes |
| Closing | Your list, your rules. · Open the demo, unlock a sample list, and check your first address in under a minute. · Launch the demo | Votre liste, vos règles. · Ouvrez la démo, déverrouillez une liste d'exemple et vérifiez votre première adresse en moins d'une minute. · Lancer la démo |

**FAQ (EN / FR).**

1. *Who can see my contacts?* Only you, unless you choose otherwise. Private contacts are encrypted on your device; circle contacts are encrypted for the members of that circle; public contacts are readable by anyone. / *Qui peut voir mes contacts ?* Vous seul, sauf si vous en décidez autrement. Les contacts privés sont chiffrés sur votre appareil, ceux d'un cercle le sont pour ses membres, et les contacts publics sont lisibles par tous.
2. *Does TrustList give people a trust score?* No. You set your own level (Trusted, Known, Unverified, Flagged). TrustList adds two facts you can check: whether the owner verified the address, and how many people you trust vouch for it. / *TrustList attribue-t-il une note de confiance ?* Non. Vous choisissez votre niveau (De confiance, Connu, Non vérifié, Signalé). TrustList ajoute deux faits vérifiables : l'adresse a-t-elle été vérifiée par son propriétaire, et combien de personnes de confiance s'en portent garantes.
3. *What is a lookalike address?* An address made to start and end like one you know, often planted with a tiny transfer so you copy it from your history. TrustList flags it and shows exactly which characters differ. / *Qu'est-ce qu'une adresse imitée ?* Une adresse conçue pour commencer et finir comme une adresse connue, souvent glissée dans votre historique par un transfert minuscule pour que vous la copiiez. TrustList la signale et montre exactement les caractères qui diffèrent.
4. *What do apps see when I connect them?* Only the scopes you allow: names and address labels, trust levels and tags, warnings. Never your notes. You can revoke access at any time. / *Que voient les applis que je connecte ?* Seulement ce que vous autorisez : noms et libellés, niveaux de confiance et étiquettes, alertes. Jamais vos notes. Vous pouvez révoquer l'accès à tout moment.
5. *Does it cost anything?* Keeping contacts private or in a circle costs nothing. Publishing a public contact or a vouch is an on-chain transaction, so it has a network fee. In this demo everything is simulated on a testnet. / *Est-ce payant ?* Garder des contacts privés ou dans un cercle ne coûte rien. Publier un contact public ou une garantie est une transaction on-chain, avec des frais de réseau. Dans cette démo, tout est simulé sur un testnet.
6. *Is this a real product?* It is a working demo of Monark's Trust Contacts module, built in the open with the community. No real wallet, chain or funds are involved. / *Est-ce un vrai produit ?* C'est une démo fonctionnelle du module Contacts de confiance de Monark, construite en open source avec la communauté. Aucun vrai portefeuille, réseau ou fonds n'est utilisé.

### App: key strings

| Slot | English | Français |
|-|-|-|
| Gate | Unlock your contact list · Your list is encrypted with your wallet. Sign in to decrypt it on this device. · Connect demo wallet | Déverrouillez votre liste de contacts · Votre liste est chiffrée avec votre portefeuille. Connectez-vous pour la déchiffrer sur cet appareil. · Connecter le portefeuille de démo |
| Gate rejected | You declined the sign-in. Your list stays locked and nothing was shared. | Vous avez refusé la connexion. Votre liste reste verrouillée et rien n'a été partagé. |
| Decrypting | Decrypting your list… | Déchiffrement de votre liste… |
| Tabs | Contacts · Check an address · Connected apps | Contacts · Vérifier une adresse · Applis connectées |
| List H1 | Your contacts | Vos contacts |
| Search | Search names, tags, notes or addresses | Rechercher un nom, une étiquette, une note ou une adresse |
| Kind chips | All · People · Organisations · My addresses | Tous · Personnes · Organisations · Mes adresses |
| Trust levels | Trusted · Known · Unverified · Flagged | De confiance · Connu · Non vérifié · Signalé |
| Visibility | Private · Circle · Public | Privé · Cercle · Public |
| Empty search | No contact matches "{q}". Try a name, a tag, or the first characters of an address. | Aucun contact ne correspond à « {q} ». Essayez un nom, une étiquette ou le début d'une adresse. |
| Empty list | Your list is empty. Add the first address you trust, or reset the demo to get the examples back. | Votre liste est vide. Ajoutez une première adresse de confiance, ou réinitialisez la démo pour retrouver les exemples. |
| Add | Add contact | Ajouter un contact |
| Check verdicts | Safe to send · Check first · Don't send · Unknown address · One of your wallets | Envoi sûr · À vérifier · N'envoyez pas · Adresse inconnue · Un de vos portefeuilles |
| Lookalike | This looks like {name}'s address, but {n} of 40 characters differ. It's probably an address-poisoning attempt. | Cette adresse ressemble à celle de {name}, mais {n} caractères sur 40 diffèrent. C'est sans doute une tentative d'empoisonnement d'adresse. |
| Circle down | We couldn't reach your circles. This answer uses your own list only. | Impossible de joindre vos cercles. Cette réponse ne tient compte que de votre liste. |
| Tx | Confirm in your wallet · Waiting for the network… · Confirmed · Failed · You rejected the request in your wallet. · The transaction failed on the network. Nothing changed. · Try again | Confirmez dans votre portefeuille · En attente du réseau… · Confirmée · Échec · Vous avez refusé la demande dans votre portefeuille. · La transaction a échoué sur le réseau. Rien n'a changé. · Réessayer |
| Disclaimer | Testnet demo · not financial advice · no real funds | Démo sur testnet · pas un conseil financier · aucuns fonds réels |
| Demo badge | Demo · simulated data | Démo · données simulées |

The complete list (form validation, demo controls, contact page, apps page, how-it-works and credits copy) is in the dictionaries.

## 8. Aesthetics (within the Monark guidelines)

Colour, type, logo, header and footer are fixed by the guidelines: cream / espresso tokens derived from `#f88d10` with `--surface-tint: 1` (the §3 token block pasted over the registry base theme), Nunito Sans 400/600/700/800, pill actions, 1rem cards, borders not shadows, flat orange only, one primary action per view.

- **Layout and rhythm.** Home alternates statement bands and dense bands: asymmetric hero (copy left, activity card right; stacked on mobile) → outcomes (three columns, outline icons top-left) → "Check before you send" (a wide band: explanation left, the lookalike diff right) → visibility levels (three cards on a muted band) → the app hub diagram (centred) → photo cards → FAQ (single 68ch column) → closing band. The branded section divider appears twice. The app is a working tool: a dense list with a right rail on desktop, single column on mobile, 44px touch targets, addresses always monospace and shortened with the full value on copy.
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
| `public/brand/*` Monark logos (standalone, horizontal light/dark, vertical light/dark) | Header pairing, footer, 404, favicon, wallet prompt, unlock gate | Shell |
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
- Toasts sit top-right under the header and app bar on desktop and under the header on phones; page titles, verdicts and contact headers are left-aligned, so they never cover what they report on.
- Seeded examples are created in the visitor's language on first load and on "Reset demo" (they are the user's own data afterwards). The FAQ uses native `<details>`.
- Screenshots in `docs/screenshots/` are taken with reduced motion, so animations appear in their settled state: every page and flow at 390 and 1440 px, light and dark, in English; home, how-it-works, contacts, the lookalike check, verification, the add-contact lookalike warning and the apps request in French.
