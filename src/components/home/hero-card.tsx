"use client"

import { ArrowDownLeftIcon, ArrowUpRightIcon, Loader2Icon, OctagonAlertIcon, ScanSearchIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { TrustChip, VerifiedMark } from "@/components/demo/chips"
import { WalletAvatar } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import type { TrustLevel } from "@/lib/demo/types"
import { shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface HeroRow {
  address: string
  direction: "in" | "out"
  text: string
  name: string
  role: string
  trust?: TrustLevel
  trustLabel?: string
  verified?: boolean
  lookalikeOf?: string
}

/**
 * Signature moment 1: a wallet's raw history resolves into names, one row at
 * a time, and one "familiar" address turns out to be a lookalike. Loops calmly;
 * with reduced motion it renders the resolved state once.
 */
export function HeroCard({
  rows,
  copy,
}: {
  rows: HeroRow[]
  copy: { label: string; title: string; resolving: string; done: string; lookalike: string; dontCopy: string; verified: string }
}) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      const id = window.setTimeout(() => setStep(rows.length), 0)
      return () => window.clearTimeout(id)
    }
    let s = 0
    let timer: number
    const tick = () => {
      s = s >= rows.length ? 0 : s + 1
      setStep(s)
      timer = window.setTimeout(tick, s === rows.length ? 7000 : s === 0 ? 900 : 420)
    }
    timer = window.setTimeout(tick, 700)
    return () => window.clearTimeout(timer)
  }, [rows.length])

  const done = step >= rows.length
  const warnings = rows.filter((r) => r.lookalikeOf).length

  return (
    <figure aria-label={copy.label} className="relative rounded-[1.75rem] border bg-card p-2 shadow-sm sm:p-3">
      <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-3">
        <figcaption className="text-sm font-bold">{copy.title}</figcaption>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground" aria-hidden="true">
          {done ? <ScanSearchIcon className="size-3.5 text-primary" /> : <Loader2Icon className="size-3.5 animate-spin text-primary" />}
          {done ? t(copy.done, { named: rows.length - warnings, warnings }) : copy.resolving}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {rows.map((r, i) => {
          const resolved = i < step
          const bad = !!r.lookalikeOf
          return (
            <li
              key={r.address}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors duration-200",
                resolved && bad ? "border-destructive/50 bg-destructive/5" : "border-transparent bg-background"
              )}
            >
              <WalletAvatar address={r.address} size={34} />
              <div className="min-w-0 flex-1 leading-tight">
                {resolved ? (
                  <div key="named" className="tl-resolve">
                    {bad ? (
                      <p className="flex items-center gap-1.5 text-sm font-bold text-destructive">
                        <OctagonAlertIcon className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{t(copy.lookalike, { name: r.lookalikeOf ?? "" })}</span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-1 text-sm font-bold">
                        <span className="truncate">{r.name}</span>
                        {r.verified ? <VerifiedMark label={copy.verified} withText={false} /> : null}
                      </p>
                    )}
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="font-mono">{shortAddress(r.address)}</span> · {r.text}
                    </p>
                  </div>
                ) : (
                  <div key="raw">
                    <p className="font-mono text-sm font-semibold tabular-nums">{shortAddress(r.address, 10, 8)}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.text}</p>
                  </div>
                )}
              </div>
              <span className="hidden shrink-0 sm:block">
                {resolved ? (
                  bad ? (
                    <span className="tl-resolve inline-flex h-6 items-center rounded-full bg-destructive px-2.5 text-xs font-bold text-white dark:text-background">{copy.dontCopy}</span>
                  ) : r.trust && r.trustLabel ? (
                    <TrustChip level={r.trust} label={r.trustLabel} className="tl-resolve" />
                  ) : null
                ) : r.direction === "in" ? (
                  <ArrowDownLeftIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ArrowUpRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
