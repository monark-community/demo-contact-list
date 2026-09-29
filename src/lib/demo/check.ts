import { isAddress } from "./ids"
import type { AddressEntry, Contact, DemoState, DirectoryEntry } from "./types"

/**
 * The address check. Pure and synchronous, so the same logic can run in the
 * add-contact form, the check page and (later) inside any connected app.
 *
 * Decision order: not an address -> one of your wallets -> in your list ->
 * lookalike of someone in your list -> known to your circles -> stranger.
 */

export type Verdict = "safe" | "caution" | "danger" | "unknown" | "yours" | "invalid"

export type Reason =
  | "invalid"
  | "own"
  | "trusted"
  | "known"
  | "unverified"
  | "flagged"
  | "lookalike"
  | "circle_vouched"
  | "circle_flagged"
  | "stranger"

export interface Lookalike {
  contact: Contact
  entry: AddressEntry
  /** Per hex character (40): true where the pasted address differs from the real one. */
  diff: boolean[]
  differing: number
}

export interface CheckResult {
  input: string
  address: string
  verdict: Verdict
  reason: Reason
  contact?: Contact
  entry?: AddressEntry
  lookalike?: Lookalike
  directory?: DirectoryEntry
  /** False when the circle lookup failed: the answer uses your own list only. */
  circlesReachable: boolean
}

/** Characters at each end a poisoner copies. Four is what most wallets show. */
const EDGE = 4

export function normalize(input: string): string {
  return input.trim().toLowerCase()
}

export function diffAddresses(a: string, b: string): boolean[] {
  const x = normalize(a).slice(2)
  const y = normalize(b).slice(2)
  return Array.from({ length: 40 }, (_, i) => x[i] !== y[i])
}

export function findExact(state: Pick<DemoState, "contacts">, address: string) {
  const target = normalize(address)
  for (const contact of state.contacts) {
    const entry = contact.addresses.find((a) => normalize(a.address) === target)
    if (entry) return { contact, entry }
  }
  return null
}

export function findLookalike(state: Pick<DemoState, "contacts">, address: string): Lookalike | null {
  const target = normalize(address).slice(2)
  let best: Lookalike | null = null
  for (const contact of state.contacts) {
    if (contact.trust === "flagged") continue
    for (const entry of contact.addresses) {
      const real = normalize(entry.address).slice(2)
      if (real === target) continue
      if (real.slice(0, EDGE) === target.slice(0, EDGE) && real.slice(-EDGE) === target.slice(-EDGE)) {
        const diff = diffAddresses(`0x${target}`, entry.address)
        const differing = diff.filter(Boolean).length
        if (!best || differing < best.differing) best = { contact, entry, diff, differing }
      }
    }
  }
  return best
}

export function checkAddress(
  input: string,
  state: Pick<DemoState, "contacts" | "directory">,
  options: { circlesReachable: boolean } = { circlesReachable: true }
): CheckResult {
  const address = normalize(input)
  const base = { input, address, circlesReachable: options.circlesReachable }

  if (!isAddress(address)) return { ...base, verdict: "invalid", reason: "invalid" }

  const exact = findExact(state, address)
  if (exact) {
    const { contact, entry } = exact
    if (contact.kind === "self") return { ...base, verdict: "yours", reason: "own", contact, entry }
    if (contact.trust === "flagged") return { ...base, verdict: "danger", reason: "flagged", contact, entry }
    if (contact.trust === "unverified") return { ...base, verdict: "caution", reason: "unverified", contact, entry }
    return { ...base, verdict: "safe", reason: contact.trust, contact, entry }
  }

  const lookalike = findLookalike(state, address)
  if (lookalike) return { ...base, verdict: "danger", reason: "lookalike", lookalike }

  if (options.circlesReachable) {
    const known = state.directory.find((d) => normalize(d.address) === address)
    if (known?.kind === "flagged") return { ...base, verdict: "danger", reason: "circle_flagged", directory: known }
    if (known) return { ...base, verdict: "caution", reason: "circle_vouched", directory: known }
  }

  return { ...base, verdict: "unknown", reason: "stranger" }
}
