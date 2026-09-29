"use client"

import { LockIcon, OctagonAlertIcon, RotateCcwIcon, ShieldOffIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { WalletAvatar } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { ADDR } from "@/lib/demo/addresses"
import { useTx } from "@/lib/demo/chain"
import { findExact } from "@/lib/demo/check"
import { grantApp, requestAgain, revokeApp } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import type { AppGrant, AppId, DemoState, Scope } from "@/lib/demo/types"
import { formatDate, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { AppMark } from "./app-mark"
import { TrustChip } from "./chips"
import { TxFeedback } from "./tx-feedback"

const SCOPES: Scope[] = ["names", "trust", "warnings"]

/** The addresses each app has on screen in the preview. The last one is the club's flagged drainer. */
const PREVIEW_ADDRESSES: Record<AppId, string[]> = {
  splitflow: [ADDR.ines, ADDR.malik, ADDR.sofia, ADDR.drainer],
  taskflow: [ADDR.malik, ADDR.sofia, ADDR.priya, ADDR.drainer],
  govchain: [ADDR.jonah, ADDR.theo, ADDR.ines, ADDR.drainer],
}

export function AppsView() {
  const demo = useDemo() as DemoState
  const { app } = useAppCopy()
  const a = app.apps
  const request = demo.apps.find((x) => x.status === "requested")
  const others = demo.apps.filter((x) => x.status !== "requested")
  const [previewId, setPreviewId] = useState<AppId>(request?.id ?? "splitflow")
  const [animateKey, setAnimateKey] = useState(0)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{a.title}</h1>
        <InfoTip label={app.info}>{a.about}</InfoTip>
      </div>

      {request ? (
        <RequestCard
          grant={request}
          onGranted={() => {
            setPreviewId(request.id)
            setAnimateKey((k) => k + 1)
          }}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="connected-title" className="flex flex-col gap-3">
          <h2 id="connected-title" className="text-xl font-bold">
            {a.connected}
          </h2>
          <ul className="flex flex-col gap-3">
            {others.map((g) => (
              <li key={g.id}>
                <GrantCard grant={g} onSelect={() => setPreviewId(g.id)} selected={previewId === g.id} />
              </li>
            ))}
          </ul>
          {!request ? <p className="text-sm text-muted-foreground">{a.noRequest}</p> : null}
        </section>

        <section aria-labelledby="preview-title" className="flex flex-col gap-3">
          <h2 id="preview-title" className="text-xl font-bold">
            {t(a.previewTitle, { app: a.meta[previewId].name })}
          </h2>
          <div role="group" aria-label={app.tabs.apps} className="flex flex-wrap gap-1.5">
            {demo.apps.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-pressed={previewId === g.id}
                onClick={() => setPreviewId(g.id)}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors pointer-coarse:h-11",
                  previewId === g.id ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted"
                )}
              >
                {a.meta[g.id].name}
              </button>
            ))}
          </div>
          <AppScreen
            key={`${previewId}-${animateKey}`}
            appId={previewId}
            scopes={(() => {
              const g = demo.apps.find((x) => x.id === previewId)
              return g?.status === "connected" ? g.scopes : []
            })()}
            animate
          />
        </section>
      </div>
    </div>
  )
}

function RequestCard({ grant, onGranted }: { grant: AppGrant; onGranted: () => void }) {
  const { app } = useAppCopy()
  const a = app.apps
  const meta = a.meta[grant.id]
  const tx = useTx()
  const [scopes, setScopes] = useState<Scope[]>(grant.scopes)
  const [declined, setDeclined] = useState(false)

  const allow = async () => {
    setDeclined(false)
    const outcome = await tx.run(
      {
        title: t(a.allowPrompt.title, { app: meta.name }),
        rows: [
          { label: a.allowPrompt.app, value: meta.url },
          { label: a.allowPrompt.access, value: scopes.map((s) => a.scopeShort[s]).join(" · ") },
          { label: a.allowPrompt.revocable, value: a.allowPrompt.revocableValue },
        ],
        noFee: true,
      },
      () => grantApp(grant.id, scopes),
      { offchain: true, waitMs: [800, 1300] }
    )
    // No toast: the preview animates names in and the app joins "Connected".
    if (outcome === "confirmed") onGranted()
  }

  return (
    <section aria-labelledby="request-title" className="rounded-3xl border-2 border-primary bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <AppMark id={grant.id} className="size-11" />
        <div className="min-w-0">
          <h2 id="request-title" className="text-xl font-extrabold">
            {t(a.requestTitle, { app: meta.name })}
          </h2>
          <p className="text-sm text-muted-foreground">{meta.url}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">{t(a.requestTitle, { app: meta.name })}</legend>
          {SCOPES.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 font-bold transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
              <input
                type="checkbox"
                checked={scopes.includes(s)}
                onChange={(e) => setScopes((cur) => (e.target.checked ? SCOPES.filter((x) => x === s || cur.includes(x)) : cur.filter((x) => x !== s)))}
                className="size-4 accent-[var(--foreground)]"
              />
              {a.scopes[s]}
            </label>
          ))}
          <p className="flex items-center gap-3 rounded-2xl border border-dashed p-3.5 text-sm font-semibold text-muted-foreground">
            <LockIcon className="size-4 shrink-0" aria-hidden="true" />
            {a.notesNever}
          </p>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">{a.before}</p>
            <AppScreen appId={grant.id} scopes={[]} compact />
          </div>
          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-primary-ink uppercase">{a.after}</p>
            <AppScreen appId={grant.id} scopes={scopes} compact />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <TxFeedback state={tx.state} onDismiss={tx.reset} />
        {declined ? (
          <p role="status" className="text-sm text-muted-foreground">
            {t(a.declined, { app: meta.name })}
          </p>
        ) : null}
        {scopes.length === 0 ? <p className="text-sm font-semibold text-destructive">{a.needOne}</p> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" size="lg" onClick={() => setDeclined(true)} disabled={tx.busy}>
            {a.decline}
          </Button>
          <Button size="lg" onClick={() => void allow()} disabled={tx.busy || scopes.length === 0}>
            {a.allow}
          </Button>
        </div>
      </div>
    </section>
  )
}

function GrantCard({ grant, onSelect, selected }: { grant: AppGrant; onSelect: () => void; selected: boolean }) {
  const { app, locale } = useAppCopy()
  const a = app.apps
  const meta = a.meta[grant.id]
  const tx = useTx()
  const revoked = grant.status === "revoked"

  const revoke = async () => {
    const outcome = await tx.run(
      { title: t(a.revokePrompt.title, { app: meta.name }), rows: [{ label: a.allowPrompt.app, value: meta.url }], noFee: true },
      () => revokeApp(grant.id),
      { offchain: true, waitMs: [600, 1000] }
    )
    // No toast: the card switches to "Access revoked" and the preview returns to raw addresses.
    if (outcome === "confirmed") onSelect()
  }

  return (
    <article className={cn("rounded-3xl border bg-card p-5 transition-colors", selected && "border-foreground/40")}>
      <div className="flex items-start gap-3">
        <AppMark id={grant.id} />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold">
            <button type="button" onClick={onSelect} className="text-left underline-offset-4 hover:underline">
              {meta.name}
            </button>
          </h3>
          <p className="text-sm text-muted-foreground">{meta.body}</p>
        </div>
      </div>
      {revoked ? (
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <ShieldOffIcon className="size-4" aria-hidden="true" />
          {a.revokedState}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {grant.scopes.map((s) => (
            <span key={s} className="inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-semibold">
              {a.scopeShort[s]}
            </span>
          ))}
          {grant.since ? <span className="ml-1 text-xs text-muted-foreground">{t(a.since, { date: formatDate(grant.since, locale) })}</span> : null}
        </div>
      )}
      <TxFeedback state={tx.state} onDismiss={tx.reset} className="mt-3" />
      <div className="mt-4 flex flex-wrap gap-2">
        {revoked ? (
          <Button variant="outline" size="sm" onClick={() => requestAgain(grant.id)}>
            <RotateCcwIcon aria-hidden="true" />
            {a.requestAgain}
          </Button>
        ) : tx.state.phase === "idle" || tx.state.phase === "failed" || tx.state.phase === "confirmed" ? (
          <Button variant="outline" size="sm" onClick={() => void revoke()}>
            {a.revoke}
          </Button>
        ) : null}
      </div>
    </article>
  )
}

/** A miniature of the app's own screen, showing addresses the way the app sees them with these scopes. */
function AppScreen({ appId, scopes, compact, animate }: { appId: AppId; scopes: Scope[]; compact?: boolean; animate?: boolean }) {
  const demo = useDemo() as DemoState
  const { app } = useAppCopy()
  const a = app.apps
  const rows = a.preview[appId].rows
  const addresses = PREVIEW_ADDRESSES[appId]
  const names = scopes.includes("names")
  const trust = scopes.includes("trust")
  const warnings = scopes.includes("warnings")

  return (
    <div className="overflow-hidden rounded-2xl border bg-background">
      <div className="flex items-center gap-2 border-b px-3.5 py-2.5">
        <AppMark id={appId} className="size-6 rounded-md [&_svg]:size-3" />
        <span className="text-xs font-bold">{a.meta[appId].name}</span>
        <span className="ml-auto truncate text-xs text-muted-foreground">{a.preview[appId].heading}</span>
      </div>
      <ul className="divide-y">
        {addresses.map((addr, i) => {
          const hit = findExact(demo, addr)
          const flagged = hit?.contact.trust === "flagged"
          const showName = hit && names && !(flagged && !warnings)
          const warn = flagged && warnings
          return (
            <li key={addr} className={cn("flex items-center gap-2.5 px-3.5", compact ? "py-2" : "py-2.5")}>
              <WalletAvatar address={addr} size={compact ? 22 : 28} />
              <div
                key={`${showName}-${warn}-${trust}`}
                className={cn("min-w-0 flex-1 leading-tight", animate || compact ? "tl-resolve" : "")}
                style={animate ? { animationDelay: `${i * 180}ms` } : undefined}
              >
                {warn ? (
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-destructive">
                    <OctagonAlertIcon className="size-3.5" aria-hidden="true" />
                    {app.trust.levels.flagged}
                  </span>
                ) : showName ? (
                  <span className="block truncate text-sm font-bold">{hit.contact.name}</span>
                ) : (
                  <span className="block font-mono text-sm">{shortAddress(addr)}</span>
                )}
                <span className="block truncate text-xs text-muted-foreground">{rows[i] ?? (warn ? hit?.contact.name : "")}</span>
              </div>
              {trust && hit && !flagged && !compact ? <TrustChip level={hit.contact.trust} label={app.trust.levels[hit.contact.trust]} /> : null}
              {trust && hit && !flagged && compact ? (
                <TrustChip level={hit.contact.trust} label={app.trust.levels[hit.contact.trust]} className="hidden xl:inline-flex" />
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
