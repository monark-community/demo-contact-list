"use client"

import { useCallback, useRef, useState } from "react"

import { randomHash } from "./ids"
import { getDemo, requestSignature, setSettings } from "./store"
import type { TxError, TxState, TxSummary } from "./types"

/**
 * Simulated network. Two kinds of step:
 *
 * - an on-chain transaction (publish, vouch, unpublish): wallet prompt with a
 *   fee -> pending with a hash for a realistic block time -> confirmed or reverted;
 * - an off-chain signature (verification request, app permission): wallet
 *   prompt without fee -> waiting (e.g. for the other person to sign) ->
 *   confirmed or expired.
 *
 * "Make the next network step fail" in the demo controls forces one failure.
 */

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function blockTime(): number {
  const slow = getDemo()?.settings.slow
  const [min, max] = slow ? [3000, 6000] : [1200, 2400]
  return Math.round(min + Math.random() * (max - min))
}

/** Consume the "fail next" switch. Returns true if this step must fail. */
export function takeFailure(): boolean {
  const demo = getDemo()
  if (demo?.settings.failNext) {
    setSettings({ failNext: false })
    return true
  }
  return false
}

/** Estimated network fee shown in the wallet prompt (simulated, in tETH). */
export function estimateFee(): string {
  return (0.00018 + Math.random() * 0.00014).toFixed(5)
}

/** How a step ended ("busy" when another step was already running). */
export type TxOutcome = "confirmed" | TxError | "busy"

export interface RunOptions {
  /** A free signature: no hash, and a failure reads as "expired" rather than "reverted". */
  offchain?: boolean
  /** Extra wait after signing for off-chain steps (e.g. the other person signing). */
  waitMs?: [number, number]
}

/**
 * One transaction's lifecycle for a component. `apply` runs only on
 * confirmation and receives the transaction hash (empty for off-chain steps).
 */
export function useTx() {
  const [state, setState] = useState<TxState>({ phase: "idle" })
  const busy = useRef(false)

  const run = useCallback(async (summary: TxSummary, apply: (hash: string) => void, options: RunOptions = {}): Promise<TxOutcome> => {
    if (busy.current) return "busy"
    busy.current = true
    try {
      setState({ phase: "signing" })
      const ok = await requestSignature(summary)
      if (!ok) {
        setState({ phase: "failed", error: "rejected" })
        return "rejected"
      }
      if (options.offchain) {
        setState({ phase: "pending" })
        const [min, max] = options.waitMs ?? [700, 1200]
        const slow = getDemo()?.settings.slow ? 2 : 1
        await sleep(Math.round((min + Math.random() * (max - min)) * slow))
        if (takeFailure()) {
          setState({ phase: "failed", error: "expired" })
          return "expired"
        }
        apply("")
        setState({ phase: "confirmed" })
        return "confirmed"
      }
      const hash = randomHash()
      setState({ phase: "pending", hash })
      await sleep(blockTime())
      if (takeFailure()) {
        setState({ phase: "failed", hash, error: "reverted" })
        return "reverted"
      }
      apply(hash)
      setState({ phase: "confirmed", hash })
      return "confirmed"
    } finally {
      busy.current = false
    }
  }, [])

  const reset = useCallback(() => setState({ phase: "idle" }), [])

  return { state, run, reset, busy: state.phase === "signing" || state.phase === "pending" }
}
