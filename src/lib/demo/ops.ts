"use client"

import { randomHex, randomId } from "./ids"
import { getDemo, update, updateContact } from "./store"
import type { AppId, Contact, ContactKind, LogEntry, Scope, TagTone, TrustLevel, Visibility } from "./types"

/**
 * State changes, applied only once the simulated step they depend on has
 * confirmed. With a real backend each of these becomes a write to the
 * encrypted local store, an IPFS upload or an attestation call.
 */

const now = () => new Date().toISOString()

function entry(kind: LogEntry["kind"], extra: Partial<LogEntry> = {}): LogEntry {
  return { id: randomId("log"), at: now(), kind, ...extra }
}

export function fakeCid(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567"
  let out = "bafybei"
  const hex = randomHex(104)
  for (let i = 0; i < 52; i++) out += alphabet[parseInt(hex.slice(i * 2, i * 2 + 2), 16) % 32]
  return out
}

export interface NewContact {
  kind: ContactKind
  name: string
  role: string
  address: string
  purpose: string
  tags: string[]
  trust: TrustLevel
  note: string
  visibility: Visibility
  circleId?: string
  met?: string
}

/** Adds a contact and returns its id. `hash` is the publishing transaction for circle/public entries. */
export function addContact(input: NewContact, hash?: string): string {
  const slug = input.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32)
  const id = `${slug || "contact"}-${randomHex(4)}`
  const at = now()
  const log: LogEntry[] = [input.met ? entry("met", { detail: input.met }) : entry("added")]
  const published = input.visibility !== "private"
  if (published) log.unshift(entry("published", { hash }))
  const contact: Contact = {
    id,
    kind: input.kind,
    name: input.name.trim(),
    role: input.role.trim(),
    addresses: [{ address: input.address.trim().toLowerCase(), purpose: input.purpose.trim() }],
    tags: input.tags,
    trust: input.trust,
    note: input.note.trim(),
    visibility: input.visibility,
    circleId: input.visibility === "circle" ? input.circleId : undefined,
    vouches: 0,
    cid: published ? fakeCid() : undefined,
    createdAt: at,
    updatedAt: at,
    log,
  }
  update((s) => ({ ...s, contacts: [contact, ...s.contacts] }))
  return id
}

export function createTag(label: string, tone: TagTone = "neutral"): string {
  const clean = label.trim().slice(0, 32)
  const existing = getDemo()?.tags.find((t) => t.label.toLowerCase() === clean.toLowerCase())
  if (existing) return existing.id
  const id = randomId("tag")
  update((s) => ({ ...s, tags: [...s.tags, { id, label: clean, tone }] }))
  return id
}

/** Private details (trust, tags, note, role, purposes) save instantly: the key was derived at sign-in. */
export function saveDetails(
  id: string,
  patch: Partial<Pick<Contact, "name" | "role" | "trust" | "tags" | "note" | "addresses">>
) {
  updateContact(id, (c) => {
    const log = [...c.log]
    if (patch.trust && patch.trust !== c.trust) log.unshift(entry("trust_changed", { detail: patch.trust }))
    return { ...c, ...patch, log, updatedAt: now() }
  })
}

export function markVerified(id: string) {
  updateContact(id, (c) => ({ ...c, verifiedAt: now(), log: [entry("verified"), ...c.log], updatedAt: now() }))
}

export function logVerifyExpired(id: string) {
  updateContact(id, (c) => ({ ...c, log: [entry("verify_expired"), ...c.log] }))
}

export function recordVouch(id: string, hash: string) {
  updateContact(id, (c) => ({
    ...c,
    vouches: c.vouches + 1,
    myVouch: { at: now(), hash },
    log: [entry("vouched", { hash }), ...c.log],
    updatedAt: now(),
  }))
}

export function changeVisibility(id: string, visibility: Visibility, circleId: string | undefined, hash: string) {
  updateContact(id, (c) => {
    const published = visibility !== "private"
    return {
      ...c,
      visibility,
      circleId: visibility === "circle" ? circleId : undefined,
      cid: published ? fakeCid() : undefined,
      log: [entry(published ? "published" : "unpublished", { hash: hash || undefined }), ...c.log],
      updatedAt: now(),
    }
  })
}

export function deleteContact(id: string) {
  update((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== id) }))
}

/** Flag an address from the check page: a private, flagged contact. */
export function flagAddress(address: string, name: string, spamTagId: string | undefined, note: string): string {
  return addContact({
    kind: "org",
    name,
    role: "",
    address,
    purpose: "",
    tags: spamTagId ? [spamTagId] : [],
    trust: "flagged",
    note,
    visibility: "private",
  })
}

export function grantApp(id: AppId, scopes: Scope[]) {
  update((s) => ({ ...s, apps: s.apps.map((a) => (a.id === id ? { ...a, status: "connected", scopes, since: now() } : a)) }))
}

export function revokeApp(id: AppId) {
  update((s) => ({ ...s, apps: s.apps.map((a) => (a.id === id ? { ...a, status: "revoked", since: now() } : a)) }))
}

export function requestAgain(id: AppId) {
  update((s) => ({
    ...s,
    apps: s.apps.map((a) => (a.id === id ? { ...a, status: "requested", scopes: ["names", "trust", "warnings"], since: undefined } : a)),
  }))
}
