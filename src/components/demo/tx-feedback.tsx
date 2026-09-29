"use client"

import { Loader2Icon, RotateCcwIcon, WalletIcon, XCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TxStatus } from "@/components/ui/tx-status"
import type { TxState } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

/**
 * One step's visible lifecycle: signing -> pending (hash for on-chain steps) ->
 * confirmed, or failed with a plain-language reason and a retry.
 */
export function TxFeedback({
  state,
  pendingLabel,
  confirmedLabel,
  failedLabel,
  onRetry,
  onDismiss,
  hideConfirmed,
  className,
}: {
  state: TxState
  pendingLabel?: string
  confirmedLabel?: string
  /** Replaces the generic reason for on-chain or expiry failures (a rejection keeps its own message). */
  failedLabel?: string
  onRetry?: () => void
  onDismiss?: () => void
  hideConfirmed?: boolean
  className?: string
}) {
  const { app } = useAppCopy()
  const tx = app.tx

  if (state.phase === "idle") return null
  if (state.phase === "confirmed" && (hideConfirmed || !state.hash)) return null

  const reason = state.error === "rejected" ? tx.rejected : (failedLabel ?? (state.error === "expired" ? tx.expired : tx.reverted))

  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col gap-2", className)}>
      {state.phase === "signing" ? (
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <WalletIcon className="size-4 text-primary" aria-hidden="true" />
          {tx.signing}
        </p>
      ) : null}

      {state.phase === "pending" ? (
        <div className="flex flex-col items-start gap-1.5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <Loader2Icon className="size-4 animate-spin text-primary" aria-hidden="true" />
            {pendingLabel ?? tx.pending}
          </p>
          {state.hash ? <TxStatus status="pending" hash={state.hash} label={tx.pending} /> : null}
        </div>
      ) : null}

      {state.phase === "confirmed" && state.hash ? (
        <TxStatus status="confirmed" hash={state.hash} label={confirmedLabel ?? tx.confirmed} className="self-start" />
      ) : null}

      {state.phase === "failed" ? (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-3.5">
          <p className="flex items-start gap-2 text-sm">
            <XCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <span>
              <span className="font-bold text-destructive">{tx.failed}. </span>
              {reason}
            </span>
          </p>
          {state.hash ? <TxStatus status="failed" hash={state.hash} label={tx.failed} className="self-start" /> : null}
          {onRetry || onDismiss ? (
            <div className="flex flex-wrap gap-2">
              {onRetry ? (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RotateCcwIcon aria-hidden="true" />
                  {tx.retry}
                </Button>
              ) : null}
              {onDismiss ? (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  {tx.dismiss}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
