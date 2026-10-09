"use client"

import Image from "next/image"
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { WalletPrompt } from "@/components/ui/wallet-prompt"
import type { Dictionary } from "@/i18n"
import { intlLocale, type Locale } from "@/i18n/config"
import { estimateFee } from "@/lib/demo/chain"
import { initDemo, useDemo, usePrompt } from "@/lib/demo/store"

export interface AppCopy {
  locale: Locale
  app: Dictionary["app"]
  seed: Dictionary["seed"]
  disclaimer: string
  close: string
  copy: string
  copied: string
}

const AppContext = createContext<AppCopy | null>(null)

export function useAppCopy(): AppCopy {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppCopy must be used inside <AppProvider>")
  return ctx
}

/**
 * TxFeedback's translated labels. `failedReason` replaces the reason for
 * on-chain or expiry failures; a rejection keeps its own message.
 */
export function useTxCopy(failedReason?: string) {
  const tx = useAppCopy().app.tx
  return {
    signingLabel: tx.signing,
    pendingLabel: tx.pending,
    pendingStatusLabel: tx.pending,
    confirmedLabel: tx.confirmed,
    failedLabel: tx.failed,
    retryLabel: tx.retry,
    dismissLabel: tx.dismiss,
    reasons: { rejected: tx.rejected, reverted: failedReason ?? tx.reverted, expired: failedReason ?? tx.expired },
  }
}

export function AppProvider({ value, children }: { value: AppCopy; children: ReactNode }) {
  useEffect(() => {
    initDemo(value.seed, value.locale)
  }, [value.seed, value.locale])

  return (
    <AppContext.Provider value={value}>
      {children}
      <DemoWalletPrompt />
      <Toaster
        // Top-right, just under the sticky header and the app bar: page titles,
        // verdicts and contact headers are left-aligned, so this corner stays
        // clear of what a toast reports on. On phones sonner goes full width
        // and sits under the header.
        position="top-right"
        offset={{ top: 124, right: 24 }}
        mobileOffset={{ top: 72, left: 16, right: 16 }}
      />
    </AppContext.Provider>
  )
}

/** The simulated wallet's confirmation sheet, driven by the demo store. Closing it counts as a rejection. */
function DemoWalletPrompt() {
  const prompt = usePrompt()
  const demo = useDemo()
  const { app, disclaimer, locale, close } = useAppCopy()
  const p = app.prompt
  // A fresh fee estimate per request.
  const fee = useMemo(() => (prompt ? estimateFee() : ""), [prompt])
  const free = prompt?.summary.noFee

  return (
    <WalletPrompt
      open={!!prompt}
      onConfirm={() => prompt?.resolve(true)}
      onReject={() => prompt?.resolve(false)}
      site={
        <>
          <Image src="/brand/monark-mark.svg" alt="" width={20} height={20} unoptimized />
          {p.site}
        </>
      }
      title={prompt?.summary.title ?? p.title}
      description={p.title}
      account={demo ? { name: demo.wallet.name, address: demo.wallet.address } : undefined}
      rows={prompt?.summary.rows}
      network={app.network}
      networkLabel={p.network}
      fee={fee ? `${Number(fee).toLocaleString(intlLocale[locale], { maximumFractionDigits: 5 })} tETH` : undefined}
      noFee={free}
      feeLabel={p.fee}
      noFeeLabel={p.free}
      disclaimer={prompt?.summary.movesValue || !free ? disclaimer : null}
      warning
      confirmLabel={p.confirm}
      rejectLabel={p.reject}
      closeLabel={close}
    />
  )
}
