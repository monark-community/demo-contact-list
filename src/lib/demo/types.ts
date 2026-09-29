/**
 * Domain types for the TrustList demo. Everything the UI knows about contacts,
 * circles, connected apps, the wallet and transactions goes through these
 * shapes, so the simulated layer in this folder could be replaced by real
 * storage (encrypted local store, IPFS, an attestation contract) and
 * wagmi/viem calls without UI changes.
 */

export type ContactKind = "person" | "org" | "self"

/** Your own judgement. TrustList never computes a score. */
export type TrustLevel = "trusted" | "known" | "unverified" | "flagged"

/** Where a contact lives: encrypted on your device, encrypted for a circle, or published. */
export type Visibility = "private" | "circle" | "public"

export interface AddressEntry {
  address: string
  /** What this address is for: "Main wallet", "Club treasury (multisig)". */
  purpose: string
}

export type TagTone = "positive" | "neutral" | "caution"

export interface Tag {
  id: string
  label: string
  tone: TagTone
}

export type AppId = "splitflow" | "taskflow" | "govchain"

export type LogKind =
  | "added"
  | "met"
  | "payment_in"
  | "payment_out"
  | "verified"
  | "verify_expired"
  | "vouched"
  | "published"
  | "unpublished"
  | "trust_changed"
  | "app_event"

/** One timestamped entry in a contact's interaction log. Rendered through the dictionary. */
export interface LogEntry {
  id: string
  at: string
  kind: LogKind
  /** Free text: where you met, the app event description, the new trust level… */
  detail?: string
  /** Amount moved, formatted with the active locale at display time. */
  amount?: { value: number; token: "tUSDC" | "tETH" }
  app?: AppId
  hash?: string
}

export interface Contact {
  id: string
  kind: ContactKind
  name: string
  role: string
  addresses: AddressEntry[]
  tags: string[]
  trust: TrustLevel
  /** Private note: never shared, published or given to apps. */
  note: string
  visibility: Visibility
  circleId?: string
  /** Set when the owner signed a message confirming this label. */
  verifiedAt?: string
  /** Vouches published by other people in your circles. */
  vouches: number
  /** Your own public vouch, if you published one. */
  myVouch?: { at: string; hash: string }
  /** IPFS content ID when the entry is published (circle or public). */
  cid?: string
  createdAt: string
  updatedAt: string
  log: LogEntry[]
}

export interface Circle {
  id: string
  name: string
  members: number
}

/** What your circles know about addresses that are not in your own list. */
export interface DirectoryEntry {
  address: string
  name: string
  circleId: string
  kind: "vouched" | "flagged"
  count: number
  reason?: string
}

export type Scope = "names" | "trust" | "warnings"

export interface AppGrant {
  id: AppId
  status: "connected" | "requested" | "revoked"
  scopes: Scope[]
  since?: string
}

export interface WalletState {
  status: "disconnected" | "connecting" | "connected"
  address: string
  name: string
  lastError: "rejected" | null
}

export interface DemoSettings {
  /** Make the next network step fail (a reverted tx, an expired signature, an unreachable circle). */
  failNext: boolean
  slow: boolean
}

export interface DemoState {
  version: 1
  locale: "en" | "fr"
  wallet: WalletState
  settings: DemoSettings
  contacts: Contact[]
  tags: Tag[]
  circles: Circle[]
  directory: DirectoryEntry[]
  apps: AppGrant[]
}

/** What the simulated wallet prompt shows. */
export interface TxSummary {
  title: string
  rows?: { label: string; value: string }[]
  /** Shows the testnet / not-financial-advice notice. */
  movesValue?: boolean
  /** A free signature (sign-in, request, permission) rather than a paid transaction. */
  noFee?: boolean
}

export type TxPhase = "idle" | "signing" | "pending" | "confirmed" | "failed"

export type TxError = "rejected" | "reverted" | "expired"

export interface TxState {
  phase: TxPhase
  hash?: string
  error?: TxError
}
