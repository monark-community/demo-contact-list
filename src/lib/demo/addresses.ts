import { seededAddress, seededHex } from "./ids"

/**
 * Stable, valid-looking addresses for the seeded examples. Shared by the demo
 * seed and the marketing pages (the hero card and the lookalike explainer), so
 * the same people have the same addresses everywhere on the site.
 */

/** A scam address that keeps the first and last 4 hex characters of `target`. */
export function lookalikeOf(target: string, seed: string): string {
  const hex = target.slice(2)
  let middle = seededHex(`look:${seed}`, 32)
  // Make sure it really differs everywhere in the middle, like a vanity-generated fake.
  middle = middle
    .split("")
    .map((c, i) => (c === hex[4 + i] ? ((parseInt(c, 16) + 7) % 16).toString(16) : c))
    .join("")
  return `0x${hex.slice(0, 4)}${middle}${hex.slice(-4)}`
}

export const ADDR = {
  you: seededAddress("camille-main"),
  youSavings: seededAddress("camille-ledger"),
  youBurner: seededAddress("camille-burner"),
  ines: "0x7a3f91c04be2d5a6f0c38e17b4d92a65e0f3c19e",
  inesTreasury: seededAddress("campus-club-safe"),
  malik: "0x4b1c0e7da29f63b85c1e0a4d97f2b6c3e58a9e02",
  northbridge: seededAddress("northbridge-payments"),
  northbridgeGrants: seededAddress("northbridge-grants"),
  theo: seededAddress("theo-lambert"),
  sofia: seededAddress("sofia-marin"),
  cafe: seededAddress("cafe-mutuel"),
  priya: seededAddress("priya-nair"),
  jonah: seededAddress("jonah-weiss"),
  drainer: seededAddress("airdrop-drainer"),
  quartier: seededAddress("quartier-labs"),
  fakeSupport: seededAddress("fake-monark-support"),
  stranger: seededAddress("a-stranger"),
} as const

/** The address-poisoning fake of Inès's main wallet used by the check samples and the hero. */
export const INES_LOOKALIKE = lookalikeOf(ADDR.ines, "ines")
