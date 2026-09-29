"use client"

import {
  CircleHelpIcon,
  FlagIcon,
  Loader2Icon,
  OctagonAlertIcon,
  PlusIcon,
  RotateCcwIcon,
  ScanSearchIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  UsersIcon,
  WalletIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { AddressDiff } from "@/components/diagrams/address-diff"
import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { ADDR, INES_LOOKALIKE } from "@/lib/demo/addresses"
import { sleep, takeFailure } from "@/lib/demo/chain"
import { checkAddress, type CheckResult, type Verdict } from "@/lib/demo/check"
import { flagAddress } from "@/lib/demo/ops"
import { getDemo, useDemo } from "@/lib/demo/store"
import type { DemoState } from "@/lib/demo/types"
import { addressGroups, formatDate, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { TrustChip, VerifiedMark } from "./chips"

const SAMPLES = [
  { key: "ines", value: ADDR.ines },
  { key: "lookalike", value: INES_LOOKALIKE },
  { key: "circle", value: ADDR.quartier },
  { key: "flagged", value: ADDR.fakeSupport },
  { key: "stranger", value: ADDR.stranger },
  { key: "yours", value: ADDR.youSavings },
  { key: "invalid", value: "0x7a3f91c04be2d5a6f0c38e17b4d92a65e0f3c1" },
] as const

const VERDICT: Record<Verdict, { icon: LucideIcon; ring: string; tone: string }> = {
  safe: { icon: ShieldCheckIcon, ring: "border-success/60", tone: "text-success" },
  caution: { icon: TriangleAlertIcon, ring: "border-warning/70", tone: "text-warning" },
  danger: { icon: OctagonAlertIcon, ring: "border-destructive/60", tone: "text-destructive" },
  unknown: { icon: CircleHelpIcon, ring: "border-dashed border-input", tone: "text-foreground" },
  yours: { icon: WalletIcon, ring: "border-primary/70", tone: "text-foreground" },
  invalid: { icon: XCircleIcon, ring: "border-destructive/60", tone: "text-destructive" },
}

type Phase = { kind: "idle" } | { kind: "scanning"; address: string } | { kind: "done"; result: CheckResult }

export function CheckView() {
  const demo = useDemo() as DemoState
  const { app } = useAppCopy()
  const c = app.check
  const params = useSearchParams()
  const initial = params?.get("address") ?? ""
  const [value, setValue] = useState(initial)
  const [phase, setPhase] = useState<Phase>({ kind: "idle" })
  const [recent, setRecent] = useState<CheckResult[]>([])
  const run = useRef(0)
  const resultRef = useRef<HTMLDivElement>(null)

  const check = useCallback(async (raw: string) => {
    const input = raw.trim()
    const id = ++run.current
    setPhase({ kind: "scanning", address: input })
    const slow = getDemo()?.settings.slow ? 2 : 1
    await sleep(Math.round((900 + Math.random() * 500) * slow))
    if (id !== run.current) return
    const state = getDemo()
    if (!state) return
    // The circle lookup is the only network step of a check; "fail next" makes it unreachable.
    const valid = /^0x[0-9a-fA-F]{40}$/.test(input)
    const circlesReachable = valid ? !takeFailure() : true
    const result = checkAddress(input, state, { circlesReachable })
    setPhase({ kind: "done", result })
    setRecent((r) => [result, ...r.filter((x) => x.address !== result.address)].slice(0, 5))
    requestAnimationFrame(() => resultRef.current?.focus({ preventScroll: false }))
  }, [])

  // Arriving from the quick check: ?address=0x…
  const started = useRef(false)
  useEffect(() => {
    if (started.current || !initial) return
    started.current = true
    void check(initial)
  }, [initial, check])

  const result = phase.kind === "done" ? phase.result : null
  // Re-evaluate against the current list (e.g. right after flagging) without re-scanning.
  const live = result ? checkAddress(result.input, demo, { circlesReachable: result.circlesReachable }) : null

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
      <section aria-labelledby="check-title" className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h1 id="check-title" className="text-3xl font-extrabold tracking-display sm:text-4xl">
            {c.title}
          </h1>
          <InfoTip label={app.info}>{c.about}</InfoTip>
        </div>

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            if (value.trim()) void check(value)
          }}
        >
          <label htmlFor="check-input" className="sr-only">
            {c.label}
          </label>
          <input
            id="check-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={c.placeholder}
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full min-w-0 rounded-full sm:flex-1 border border-input bg-card px-5 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:text-base"
          />
          <Button type="submit" size="lg" disabled={!value.trim() || phase.kind === "scanning"} className="h-12">
            <ScanSearchIcon aria-hidden="true" />
            {c.submit}
          </Button>
        </form>

        <div className="mt-4">
          <p className="text-xs font-semibold text-muted-foreground">{c.samplesLabel}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SAMPLES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  setValue(s.value)
                  void check(s.value)
                }}
                className="inline-flex h-9 items-center rounded-full border border-input px-3.5 text-sm font-semibold transition-colors hover:bg-muted pointer-coarse:h-11"
              >
                {c.samples[s.key]}
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite" className="mt-8">
          {phase.kind === "scanning" ? <Scanning address={phase.address} label={c.scanning} /> : null}
          {live ? (
            <div ref={resultRef} tabIndex={-1} className="outline-none">
              <ResultCard result={live} />
            </div>
          ) : null}
        </div>
      </section>

      <aside className="flex flex-col gap-4 lg:pt-2" aria-labelledby="recent-title">
        <section className="rounded-3xl border bg-card p-5">
          <h2 id="recent-title" className="font-bold">
            {c.recent}
          </h2>
          {recent.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{c.noRecent}</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {recent.map((r) => {
                const v = VERDICT[r.verdict]
                const Icon = v.icon
                return (
                  <li key={r.address}>
                    <button
                      type="button"
                      onClick={() => {
                        setValue(r.input)
                        void check(r.input)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <Icon className={cn("size-4 shrink-0", v.tone)} aria-hidden="true" />
                      <span className="min-w-0 leading-tight">
                        <span className="block text-sm font-semibold">{c.verdicts[r.verdict]}</span>
                        <span className="font-mono text-xs text-muted-foreground">{shortAddress(r.input)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </aside>
    </div>
  )
}

/** The scan: the pasted address is read group by group before the verdict lands. */
function Scanning({ address, label }: { address: string; label: string }) {
  const groups = /^0x[0-9a-fA-F]{40}$/.test(address.trim()) ? addressGroups(address.trim()) : []
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, groups.length)), 90)
    return () => window.clearInterval(id)
  }, [groups.length])
  return (
    <div role="status" className="rounded-3xl border bg-card p-5 sm:p-6">
      <p className="inline-flex items-center gap-2 font-semibold">
        <Loader2Icon className="size-4 animate-spin text-primary" aria-hidden="true" />
        {label}
      </p>
      {groups.length ? (
        <p className="mt-4 flex flex-wrap gap-x-1.5 gap-y-1 font-mono text-base tabular-nums" aria-hidden="true">
          <span className="text-muted-foreground">0x</span>
          {groups.map((g, i) => (
            <span
              key={i}
              className={cn(
                "rounded-md px-0.5 transition-colors duration-150",
                i === step ? "bg-primary/25 text-foreground" : i < step ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {g}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  )
}

function ResultCard({ result }: { result: CheckResult }) {
  const { app, locale, seed } = useAppCopy()
  const demo = useDemo() as DemoState
  const c = app.check
  const v = VERDICT[result.verdict]
  const Icon = v.icon
  const circleName = (id: string) => demo.circles.find((x) => x.id === id)?.name ?? id

  let reason = ""
  switch (result.reason) {
    case "own":
      reason = t(c.reasons.own, { purpose: result.entry?.purpose || app.kinds.self })
      break
    case "trusted":
    case "known":
    case "unverified":
    case "flagged":
      reason = t(c.reasons[result.reason], { name: result.contact?.name ?? "" })
      break
    case "lookalike":
      reason = t(c.reasons.lookalike, {
        name: result.lookalike?.contact.name ?? "",
        purpose: (result.lookalike?.entry.purpose || seed.mainWallet).toLowerCase(),
        n: result.lookalike?.differing ?? 0,
      })
      break
    case "circle_vouched":
    case "circle_flagged":
      reason = t(c.reasons[result.reason], {
        count: result.directory?.count ?? 0,
        circle: circleName(result.directory?.circleId ?? ""),
        name: result.directory?.name ?? "",
        reason: result.directory?.reason ?? "",
      })
      break
    case "stranger":
      reason = c.reasons.stranger
      break
    case "invalid":
      reason = c.reasons.invalid
      break
  }

  const canFlag = result.verdict !== "invalid" && result.verdict !== "yours" && !(result.contact && result.contact.trust === "flagged") && !result.contact
  const canAdd = (result.reason === "stranger" || result.reason === "circle_vouched") && !result.contact
  const addHref = href(
    locale,
    `/app/new?address=${encodeURIComponent(result.address)}${result.directory && result.reason === "circle_vouched" ? `&name=${encodeURIComponent(result.directory.name)}` : ""}`
  )

  const flag = () => {
    const note = result.lookalike
      ? t(c.flagNoteLookalike, { name: result.lookalike.contact.name, purpose: (result.lookalike.entry.purpose || seed.mainWallet).toLowerCase() })
      : c.flagNoteGeneric
    const spam = demo.tags.find((x) => x.tone === "caution")?.id
    const name =
      result.directory?.kind === "flagged"
        ? result.directory.name
        : result.lookalike
          ? t(c.flagNameLookalike, { name: result.lookalike.contact.name })
          : c.flagName
    // No toast: the verdict card re-evaluates in place ("You flagged …").
    flagAddress(result.address, name, spam, note)
  }

  return (
    <article className={cn("tl-resolve rounded-3xl border-2 bg-card p-5 sm:p-6", v.ring)} aria-labelledby="verdict-title">
      <div className="flex items-start gap-3">
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full bg-muted", v.tone)}>
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="verdict-title" className={cn("text-2xl font-extrabold tracking-display", v.tone === "text-foreground" ? "" : v.tone)}>
            {c.verdicts[result.verdict]}
          </h2>
          <p className="mt-1 font-mono text-sm break-all text-muted-foreground">{result.input}</p>
        </div>
      </div>

      <p className="mt-4 max-w-[62ch]">{reason}</p>

      {!result.circlesReachable ? (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border border-warning/60 bg-warning/10 p-3 text-sm">
          <UsersIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          {c.circlesDown}
        </p>
      ) : null}

      {result.lookalike ? (
        <div className="mt-5 rounded-2xl border bg-background p-4">
          <AddressDiff
            real={result.lookalike.entry.address}
            pasted={result.address}
            realLabel={t(c.realLabel, { name: result.lookalike.contact.name })}
            pastedLabel={c.pastedLabel}
          />
          <p className="mt-3 text-sm font-bold text-destructive">{t(c.differ, { n: result.lookalike.differing })}</p>
        </div>
      ) : null}

      {result.contact && result.contact.kind !== "self" ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border bg-background p-4">
          <WalletAvatar address={result.contact.addresses[0]?.address ?? result.address} size={40} />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{result.contact.name}</p>
            <p className="text-sm text-muted-foreground">{result.contact.role}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <TrustChip level={result.contact.trust} label={app.trust.levels[result.contact.trust]} />
              {result.contact.verifiedAt ? (
                <VerifiedMark label={t(c.verifiedOn, { date: formatDate(result.contact.verifiedAt, locale) })} />
              ) : null}
            </div>
            {result.contact.vouches > 0 ? (
              <p className="mt-1.5 text-xs text-muted-foreground">{t(c.vouches, { n: result.contact.vouches })}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {result.contact ? (
          <Button asChild variant="outline">
            <Link href={href(locale, `/app/contacts/${result.contact.id}`)}>{c.actions.open}</Link>
          </Button>
        ) : null}
        {result.lookalike ? (
          <Button asChild variant="outline">
            <Link href={href(locale, `/app/contacts/${result.lookalike.contact.id}`)}>{t(app.form.checks.openExisting, { name: result.lookalike.contact.name })}</Link>
          </Button>
        ) : null}
        {canAdd ? (
          <Button asChild variant={result.reason === "stranger" ? "outline" : "default"}>
            <Link href={addHref}>
              <PlusIcon aria-hidden="true" />
              {c.actions.add}
            </Link>
          </Button>
        ) : null}
        {canFlag && result.verdict !== "safe" ? (
          <Button variant={result.verdict === "danger" ? "default" : "outline"} onClick={flag}>
            <FlagIcon aria-hidden="true" />
            {c.actions.flag}
          </Button>
        ) : null}
        {!result.circlesReachable ? (
          <Button variant="ghost" onClick={() => document.getElementById("check-input")?.closest("form")?.requestSubmit()}>
            <RotateCcwIcon aria-hidden="true" />
            {c.actions.again}
          </Button>
        ) : null}
      </div>
    </article>
  )
}
