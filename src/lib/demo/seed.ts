import { ADDR } from "./addresses"
import { seededHash, seededHex } from "./ids"
import type { AppGrant, Contact, DemoState, LogEntry, Tag, TagTone } from "./types"

/** Seeded example copy, supplied by the visitor's dictionary so examples are created in their language. */
export interface SeedCopy {
  wallet: string
  tags: Record<SeedTagKey, string>
  circles: { mtl: string; campus: string }
  people: {
    ines: PersonCopy & { purposes: [string, string] }
    malik: PersonCopy
    northbridge: PersonCopy & { purposes: [string, string] }
    theo: PersonCopy
    sofia: PersonCopy
    cafe: PersonCopy
    priya: PersonCopy
    jonah: PersonCopy
    drainer: PersonCopy
  }
  self: {
    main: { name: string; role: string; purpose: string }
    savings: { name: string; role: string; purpose: string }
    burner: { name: string; role: string; purpose: string }
  }
  directory: { quartier: string; fakeSupport: string; fakeSupportReason: string }
  events: {
    taskflowApproved: string
    govchainDelegated: string
    splitflowRecipient: string
  }
  mainWallet: string
}

interface PersonCopy {
  name: string
  role: string
  note: string
  met?: string
}

export type SeedTagKey =
  | "collab"
  | "partner"
  | "dev"
  | "sponsor"
  | "client"
  | "designer"
  | "ambassador"
  | "local"
  | "spam"
  | "bounty"
  | "research"

const TAG_TONES: Record<SeedTagKey, TagTone> = {
  collab: "positive",
  partner: "positive",
  sponsor: "positive",
  dev: "neutral",
  client: "neutral",
  designer: "neutral",
  ambassador: "neutral",
  local: "neutral",
  bounty: "neutral",
  research: "neutral",
  spam: "caution",
}

const DAY = 86_400_000

/** An ISO date `days` ago at a plausible local hour (seeded so it is stable per entry). */
function ago(days: number, seed: string, now: number): string {
  const hour = 9 + (parseInt(seededHex(`h:${seed}`, 2), 16) % 10)
  const minute = parseInt(seededHex(`m:${seed}`, 2), 16) % 60
  const d = new Date(now - days * DAY)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function cid(seed: string): string {
  // CIDv1 base32 shape: "bafy" + 55 lowercase base32 characters.
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567"
  const hex = seededHex(`cid:${seed}`, 110)
  let out = "bafybei"
  for (let i = 0; i < 52; i++) out += alphabet[parseInt(hex.slice(i * 2, i * 2 + 2), 16) % 32]
  return out
}

export function createSeed(copy: SeedCopy, locale: "en" | "fr", now = Date.now()): DemoState {
  const p = copy.people
  const tags: Tag[] = (Object.keys(TAG_TONES) as SeedTagKey[]).map((key) => ({
    id: `tag-${key}`,
    label: copy.tags[key],
    tone: TAG_TONES[key],
  }))

  const log = (id: string, entries: Array<Omit<LogEntry, "id" | "at"> & { days: number }>): LogEntry[] =>
    entries
      .map((e, i) => {
        const { days, ...rest } = e
        return { id: `${id}-log-${i}`, at: ago(days, `${id}-${i}`, now), ...rest }
      })
      .sort((a, b) => b.at.localeCompare(a.at))

  const contact = (c: Omit<Contact, "createdAt" | "updatedAt"> & { addedDaysAgo: number; updatedDaysAgo?: number }): Contact => {
    const { addedDaysAgo, updatedDaysAgo, ...rest } = c
    return {
      ...rest,
      createdAt: ago(addedDaysAgo, `${c.id}-created`, now),
      updatedAt: ago(updatedDaysAgo ?? addedDaysAgo, `${c.id}-updated`, now),
    }
  }

  const contacts: Contact[] = [
    contact({
      id: "ines-roy",
      kind: "person",
      name: p.ines.name,
      role: p.ines.role,
      addresses: [
        { address: ADDR.ines, purpose: p.ines.purposes[0] },
        { address: ADDR.inesTreasury, purpose: p.ines.purposes[1] },
      ],
      tags: ["tag-collab", "tag-partner"],
      trust: "trusted",
      note: p.ines.note,
      visibility: "circle",
      circleId: "campus-club",
      verifiedAt: ago(109, "ines-verified", now),
      vouches: 7,
      cid: cid("ines"),
      addedDaysAgo: 330,
      updatedDaysAgo: 12,
      log: log("ines-roy", [
        { days: 330, kind: "met", detail: p.ines.met },
        { days: 109, kind: "verified" },
        { days: 27, kind: "payment_out", amount: { value: 250, token: "tUSDC" }, app: "splitflow", hash: seededHash("ines-pay-1") },
        { days: 12, kind: "app_event", app: "taskflow", detail: copy.events.taskflowApproved },
      ]),
    }),
    contact({
      id: "malik-haddad",
      kind: "person",
      name: p.malik.name,
      role: p.malik.role,
      addresses: [{ address: ADDR.malik, purpose: copy.mainWallet }],
      tags: ["tag-dev", "tag-bounty"],
      trust: "known",
      note: p.malik.note,
      visibility: "private",
      vouches: 2,
      addedDaysAgo: 44,
      updatedDaysAgo: 19,
      log: log("malik-haddad", [
        { days: 44, kind: "met", detail: p.malik.met },
        { days: 19, kind: "payment_out", amount: { value: 420, token: "tUSDC" }, app: "taskflow", hash: seededHash("malik-bounty") },
      ]),
    }),
    contact({
      id: "northbridge-labs",
      kind: "org",
      name: p.northbridge.name,
      role: p.northbridge.role,
      addresses: [
        { address: ADDR.northbridge, purpose: p.northbridge.purposes[0] },
        { address: ADDR.northbridgeGrants, purpose: p.northbridge.purposes[1] },
      ],
      tags: ["tag-sponsor", "tag-partner"],
      trust: "trusted",
      note: p.northbridge.note,
      visibility: "public",
      verifiedAt: ago(201, "nb-verified", now),
      vouches: 12,
      cid: cid("northbridge"),
      addedDaysAgo: 214,
      updatedDaysAgo: 34,
      log: log("northbridge-labs", [
        { days: 214, kind: "added" },
        { days: 201, kind: "verified" },
        { days: 200, kind: "published", hash: seededHash("nb-publish") },
        { days: 34, kind: "payment_in", amount: { value: 2500, token: "tUSDC" }, app: "splitflow", hash: seededHash("nb-sponsor") },
      ]),
    }),
    contact({
      id: "theo-lambert",
      kind: "person",
      name: p.theo.name,
      role: p.theo.role,
      addresses: [{ address: ADDR.theo, purpose: copy.mainWallet }],
      tags: ["tag-ambassador", "tag-collab"],
      trust: "trusted",
      note: p.theo.note,
      visibility: "circle",
      circleId: "monark-mtl",
      verifiedAt: ago(160, "theo-verified", now),
      vouches: 9,
      myVouch: { at: ago(158, "theo-vouch", now), hash: seededHash("theo-vouch") },
      cid: cid("theo"),
      addedDaysAgo: 290,
      updatedDaysAgo: 8,
      log: log("theo-lambert", [
        { days: 290, kind: "met", detail: p.theo.met },
        { days: 160, kind: "verified" },
        { days: 158, kind: "vouched", hash: seededHash("theo-vouch") },
        { days: 8, kind: "app_event", app: "govchain", detail: copy.events.govchainDelegated },
      ]),
    }),
    contact({
      id: "sofia-marin",
      kind: "person",
      name: p.sofia.name,
      role: p.sofia.role,
      addresses: [{ address: ADDR.sofia, purpose: copy.mainWallet }],
      tags: ["tag-designer", "tag-client"],
      trust: "known",
      note: p.sofia.note,
      visibility: "private",
      vouches: 0,
      addedDaysAgo: 96,
      updatedDaysAgo: 70,
      log: log("sofia-marin", [
        { days: 96, kind: "added" },
        { days: 70, kind: "payment_out", amount: { value: 600, token: "tUSDC" }, hash: seededHash("sofia-invoice") },
      ]),
    }),
    contact({
      id: "cafe-mutuel",
      kind: "org",
      name: p.cafe.name,
      role: p.cafe.role,
      addresses: [{ address: ADDR.cafe, purpose: copy.mainWallet }],
      tags: ["tag-local"],
      trust: "known",
      note: p.cafe.note,
      visibility: "public",
      verifiedAt: ago(120, "cafe-verified", now),
      vouches: 4,
      cid: cid("cafe"),
      addedDaysAgo: 150,
      updatedDaysAgo: 41,
      log: log("cafe-mutuel", [
        { days: 150, kind: "added" },
        { days: 120, kind: "verified" },
        { days: 41, kind: "payment_out", amount: { value: 184.5, token: "tUSDC" }, hash: seededHash("cafe-catering") },
      ]),
    }),
    contact({
      id: "priya-nair",
      kind: "person",
      name: p.priya.name,
      role: p.priya.role,
      addresses: [{ address: ADDR.priya, purpose: copy.mainWallet }],
      tags: ["tag-research"],
      trust: "unverified",
      note: p.priya.note,
      visibility: "private",
      vouches: 1,
      addedDaysAgo: 5,
      log: log("priya-nair", [{ days: 5, kind: "met", detail: p.priya.met }]),
    }),
    contact({
      id: "jonah-weiss",
      kind: "person",
      name: p.jonah.name,
      role: p.jonah.role,
      addresses: [{ address: ADDR.jonah, purpose: copy.mainWallet }],
      tags: [],
      trust: "known",
      note: p.jonah.note,
      visibility: "circle",
      circleId: "monark-mtl",
      vouches: 5,
      cid: cid("jonah"),
      addedDaysAgo: 62,
      updatedDaysAgo: 30,
      log: log("jonah-weiss", [
        { days: 62, kind: "added" },
        { days: 30, kind: "app_event", app: "govchain", detail: copy.events.govchainDelegated },
      ]),
    }),
    contact({
      id: "airdrop-drainer",
      kind: "org",
      name: p.drainer.name,
      role: p.drainer.role,
      addresses: [{ address: ADDR.drainer, purpose: copy.mainWallet }],
      tags: ["tag-spam"],
      trust: "flagged",
      note: p.drainer.note,
      visibility: "circle",
      circleId: "campus-club",
      vouches: 0,
      cid: cid("drainer"),
      addedDaysAgo: 46,
      log: log("airdrop-drainer", [{ days: 46, kind: "added" }]),
    }),
    contact({
      id: "me-main",
      kind: "self",
      name: copy.self.main.name,
      role: copy.self.main.role,
      addresses: [{ address: ADDR.you, purpose: copy.self.main.purpose }],
      tags: [],
      trust: "trusted",
      note: "",
      visibility: "private",
      vouches: 0,
      addedDaysAgo: 400,
      log: log("me-main", [{ days: 400, kind: "added" }]),
    }),
    contact({
      id: "me-savings",
      kind: "self",
      name: copy.self.savings.name,
      role: copy.self.savings.role,
      addresses: [{ address: ADDR.youSavings, purpose: copy.self.savings.purpose }],
      tags: [],
      trust: "trusted",
      note: "",
      visibility: "private",
      vouches: 0,
      addedDaysAgo: 380,
      log: log("me-savings", [{ days: 380, kind: "added" }]),
    }),
    contact({
      id: "me-burner",
      kind: "self",
      name: copy.self.burner.name,
      role: copy.self.burner.role,
      addresses: [{ address: ADDR.youBurner, purpose: copy.self.burner.purpose }],
      tags: [],
      trust: "trusted",
      note: "",
      visibility: "private",
      vouches: 0,
      addedDaysAgo: 45,
      log: log("me-burner", [{ days: 45, kind: "added" }]),
    }),
  ]

  const apps: AppGrant[] = [
    { id: "splitflow", status: "connected", scopes: ["names", "trust", "warnings"], since: ago(150, "app-splitflow", now) },
    { id: "govchain", status: "connected", scopes: ["names"], since: ago(75, "app-govchain", now) },
    { id: "taskflow", status: "requested", scopes: ["names", "trust", "warnings"] },
  ]

  return {
    version: 1,
    locale,
    wallet: { status: "disconnected", address: ADDR.you, name: copy.wallet, lastError: null },
    settings: { failNext: false, slow: false },
    contacts,
    tags,
    circles: [
      { id: "monark-mtl", name: copy.circles.mtl, members: 42 },
      { id: "campus-club", name: copy.circles.campus, members: 18 },
    ],
    directory: [
      { address: ADDR.quartier, name: copy.directory.quartier, circleId: "monark-mtl", kind: "vouched", count: 3 },
      {
        address: ADDR.fakeSupport,
        name: copy.directory.fakeSupport,
        circleId: "campus-club",
        kind: "flagged",
        count: 5,
        reason: copy.directory.fakeSupportReason,
      },
    ],
    apps,
  }
}

/** Seeded contact ids, prerendered as static pages. */
export const SEED_CONTACT_IDS = [
  "ines-roy",
  "malik-haddad",
  "northbridge-labs",
  "theo-lambert",
  "sofia-marin",
  "cafe-mutuel",
  "priya-nair",
  "jonah-weiss",
  "airdrop-drainer",
  "me-main",
  "me-savings",
  "me-burner",
]
