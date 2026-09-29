"use client"

import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BadgeCheckIcon,
  CalendarClockIcon,
  EyeIcon,
  EyeOffIcon,
  HandshakeIcon,
  Loader2Icon,
  LockIcon,
  MegaphoneIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  ShieldHalfIcon,
  Trash2Icon,
  UserPlusIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useId, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import {
  changeVisibility,
  createTag,
  deleteContact,
  logVerifyExpired,
  markVerified,
  recordVouch,
  saveDetails,
} from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import type { Contact, DemoState, LogEntry, LogKind, TrustLevel, Visibility } from "@/lib/demo/types"
import { firstName, formatAmount, formatDate, formatDateTime, shortHash } from "@/lib/format"
import { cn } from "@/lib/utils"

import { AddressCopy } from "./address-copy"
import { useAppCopy } from "./app-provider"
import { TagChip, TrustChip, VerifiedMark, VISIBILITY_ICON, VisibilityChip } from "./chips"
import { Disclaimer } from "./disclaimer"
import { TxFeedback } from "./tx-feedback"

const TRUST: TrustLevel[] = ["trusted", "known", "unverified", "flagged"]

export function ContactView({ id }: { id: string }) {
  const demo = useDemo() as DemoState
  const { app, locale } = useAppCopy()
  const c = demo.contacts.find((x) => x.id === id)

  if (!c) {
    return (
      <section className="mx-auto flex w-full max-w-lg flex-col items-center py-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-display">{app.contact.notFoundTitle}</h1>
        <p className="mt-3 text-muted-foreground">{app.contact.notFoundBody}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href={href(locale, "/app")}>{app.contact.back}</Link>
        </Button>
      </section>
    )
  }
  return <ContactDetail contact={c} />
}

function ContactDetail({ contact: c }: { contact: Contact }) {
  const demo = useDemo() as DemoState
  const { app, locale, copy, copied } = useAppCopy()
  const k = app.contact
  const [justVerified, setJustVerified] = useState(false)
  const self = c.kind === "self"
  const circle = demo.circles.find((x) => x.id === c.circleId)
  const visibilityLabel = c.visibility === "circle" && circle ? t(app.visibility.withCircle, { circle: circle.name }) : app.visibility.levels[c.visibility]

  return (
    <div className="flex flex-col gap-6">
      <Link href={href(locale, "/app")} className="self-start text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        ← {k.back}
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-fit">
          <WalletAvatar address={c.addresses[0]?.address ?? c.id} size={64} />
          {c.verifiedAt ? (
            <span
              className={cn("absolute -right-1.5 -bottom-1.5 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary", justVerified && "tl-stamp")}
              title={k.verifiedBy}
            >
              <BadgeCheckIcon className="size-5 text-primary-foreground" aria-hidden="true" />
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-display break-words sm:text-4xl">{c.name}</h1>
          <p className="mt-1 text-muted-foreground">{c.role || (self ? k.self : "")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {!self ? <TrustChip level={c.trust} label={app.trust.levels[c.trust]} /> : null}
            {c.verifiedAt ? (
              <VerifiedMark label={`${k.verifiedBy} · ${formatDate(c.verifiedAt, locale)}`} className={cn(justVerified && "tl-stamp")} />
            ) : null}
            <VisibilityChip level={c.visibility} label={visibilityLabel} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card title={k.addresses}>
            <ul className="flex flex-col divide-y">
              {c.addresses.map((a) => (
                <li key={a.address} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="text-sm font-semibold">{a.purpose || <span className="font-normal text-muted-foreground">{k.noPurpose}</span>}</span>
                  <AddressCopy address={a.address} copyLabel={copy} copiedLabel={copied} className="min-w-0" />
                </li>
              ))}
            </ul>
          </Card>

          <DetailsCard contact={c} />

          <LogCard contact={c} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {!self ? <SignalsCard contact={c} onVerified={() => setJustVerified(true)} /> : null}
          <VisibilityCard contact={c} />
          <DangerCard contact={c} />
        </div>
      </div>
    </div>
  )
}

function Card({ title, children, action, className }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={cn("rounded-3xl border bg-card p-5 sm:p-6", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={id} className="text-lg font-bold">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------------ */

function SignalsCard({ contact: c, onVerified }: { contact: Contact; onVerified: () => void }) {
  const { app, locale, disclaimer } = useAppCopy()
  const k = app.contact
  const verify = useTx()
  const vouch = useTx()
  const first = firstName(c.name)

  const requestVerification = async () => {
    const outcome = await verify.run(
      {
        title: k.verifyPrompt.title,
        rows: [
          { label: k.verifyPrompt.to, value: c.name },
          { label: k.verifyPrompt.message, value: k.verifyPrompt.messageValue },
        ],
        noFee: true,
      },
      () => markVerified(c.id),
      { offchain: true, waitMs: [2000, 3200] }
    )
    if (outcome === "confirmed") {
      onVerified()
      toast.success(t(k.verifiedToast, { name: c.name }))
    } else if (outcome === "expired") {
      logVerifyExpired(c.id)
    }
  }

  const publishVouch = async () => {
    const outcome = await vouch.run(
      {
        title: k.vouchPrompt.title,
        rows: [{ label: k.vouchPrompt.statement, value: t(k.vouchPrompt.statementValue, { name: c.name }) }],
      },
      (hash) => recordVouch(c.id, hash)
    )
    if (outcome === "confirmed") toast.success(k.vouchedToast)
  }

  return (
    <Card title={k.signals}>
      <div className="flex flex-col gap-5">
        <TrustPicker contact={c} />

        <div className="border-t pt-5">
          <h3 className="text-sm font-bold">{k.verifiedBy}</h3>
          {c.verifiedAt ? (
            <p className="mt-2 flex items-center gap-2 text-sm">
              <BadgeCheckIcon className="size-4 text-primary" aria-hidden="true" />
              {t(k.verifiedOn, { date: formatDate(c.verifiedAt, locale) })}
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted-foreground">{k.notVerified}</p>
              {verify.state.phase === "idle" || verify.state.phase === "failed" ? (
                <Button variant="outline" className="mt-3" onClick={() => void requestVerification()} disabled={c.trust === "flagged"}>
                  <SendIcon aria-hidden="true" />
                  {t(k.askVerify, { first })}
                </Button>
              ) : null}
              <TxFeedback
                state={verify.state}
                pendingLabel={t(k.verifyWaiting, { first })}
                failedLabel={t(k.verifyExpired, { first })}
                onDismiss={verify.reset}
                className="mt-3"
              />
            </>
          )}
        </div>

        <div className="border-t pt-5">
          <h3 className="text-sm font-bold">{k.vouches}</h3>
          <p className="mt-1 text-sm">{c.vouches > 0 ? t(k.vouchesCount, { n: c.vouches }) : <span className="text-muted-foreground">{k.noVouches}</span>}</p>
          {c.myVouch ? (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
              <HandshakeIcon className="size-4 text-primary" aria-hidden="true" />
              {t(k.vouchedOn, { date: formatDate(c.myVouch.at, locale) })}
            </p>
          ) : c.trust === "flagged" ? (
            <p className="mt-2 text-xs text-muted-foreground">{k.noVouchFlagged}</p>
          ) : (
            <>
              <p className="mt-2 text-xs text-muted-foreground">{k.vouchHelp}</p>
              {vouch.state.phase === "idle" || vouch.state.phase === "failed" ? (
                <Button className="mt-3" onClick={() => void publishVouch()}>
                  <HandshakeIcon aria-hidden="true" />
                  {k.vouch}
                </Button>
              ) : null}
              <Disclaimer text={disclaimer} className="mt-2" />
            </>
          )}
          <TxFeedback state={vouch.state} failedLabel={k.vouchFailed} onDismiss={vouch.reset} className="mt-3" />
        </div>
      </div>
    </Card>
  )
}

function TrustPicker({ contact: c }: { contact: Contact }) {
  const { app } = useAppCopy()
  return (
    <fieldset>
      <legend className="text-sm font-bold">{app.contact.yourLevel}</legend>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {TRUST.map((lvl) => (
          <label
            key={lvl}
            className={cn(
              "flex h-11 cursor-pointer items-center justify-center rounded-full border px-2 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
              c.trust === lvl ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted"
            )}
          >
            <input
              type="radio"
              name={`trust-${c.id}`}
              value={lvl}
              checked={c.trust === lvl}
              onChange={() => {
                saveDetails(c.id, { trust: lvl })
                toast.success(app.contact.trustSaved, { description: app.trust.levels[lvl] })
              }}
              className="sr-only"
            />
            {app.trust.levels[lvl]}
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{app.trust.help[c.trust]}</p>
    </fieldset>
  )
}

/* ------------------------------------------------------------------------ */

function DetailsCard({ contact: c }: { contact: Contact }) {
  const demo = useDemo() as DemoState
  const { app } = useAppCopy()
  const k = app.contact
  const uid = useId()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(c.name)
  const [role, setRole] = useState(c.role)
  const [note, setNote] = useState(c.note)
  const [tags, setTags] = useState<string[]>(c.tags)
  const [purposes, setPurposes] = useState<string[]>(c.addresses.map((a) => a.purpose))
  const [newTag, setNewTag] = useState("")
  const tagById = new Map(demo.tags.map((x) => [x.id, x]))

  const start = () => {
    setName(c.name)
    setRole(c.role)
    setNote(c.note)
    setTags(c.tags)
    setPurposes(c.addresses.map((a) => a.purpose))
    setEditing(true)
  }

  const save = () => {
    if (!name.trim()) return
    saveDetails(c.id, {
      name: name.trim(),
      role: role.trim(),
      note: note.trim(),
      tags,
      addresses: c.addresses.map((a, i) => ({ ...a, purpose: (purposes[i] ?? a.purpose).trim() })),
    })
    setEditing(false)
    toast.success(k.savedLocal)
  }

  const inputCls =
    "h-11 w-full rounded-full border border-input bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"

  return (
    <Card
      title={k.details}
      action={
        !editing ? (
          <Button variant="outline" size="sm" onClick={start}>
            <PencilIcon aria-hidden="true" />
            {k.edit}
          </Button>
        ) : null
      }
    >
      {!editing ? (
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-bold">{k.tags}</h3>
            {c.tags.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.tags.map((id) => (
                  <TagChip key={id} label={tagById.get(id)?.label ?? id} tone={tagById.get(id)?.tone} />
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{k.noTags}</p>
            )}
          </div>
          <div className="rounded-2xl border border-dashed bg-muted/40 p-4">
            <h3 className="flex items-center justify-between gap-2 text-sm font-bold">
              {k.note}
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <LockIcon className="size-3.5" aria-hidden="true" />
                {k.noteLock}
              </span>
            </h3>
            <p className="mt-2 text-[0.95rem] whitespace-pre-line">{c.note || <span className="text-muted-foreground">{k.noNote}</span>}</p>
          </div>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${uid}-name`} className="text-sm font-bold">
                {k.name}
              </label>
              <input id={`${uid}-name`} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!name.trim()} className={inputCls} />
              {!name.trim() ? (
                <p role="alert" className="text-sm font-semibold text-destructive">
                  {app.form.errors.nameRequired}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${uid}-role`} className="text-sm font-bold">
                {k.role}
              </label>
              <input id={`${uid}-role`} value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} />
            </div>
            {c.addresses.map((a, i) => (
              <div key={a.address} className="flex flex-col gap-1.5">
                <label htmlFor={`${uid}-p${i}`} className="text-sm font-bold">
                  {app.form.purpose} · <span className="font-mono font-normal">{a.address.slice(0, 6)}…{a.address.slice(-4)}</span>
                </label>
                <input
                  id={`${uid}-p${i}`}
                  value={purposes[i] ?? ""}
                  onChange={(e) => setPurposes((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
          <fieldset>
            <legend className="text-sm font-bold">{k.tags}</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {demo.tags.map((x) => {
                const on = tags.includes(x.id)
                return (
                  <button
                    key={x.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTags((cur) => (on ? cur.filter((y) => y !== x.id) : [...cur, x.id]))}
                    className={cn(
                      "inline-flex h-9 items-center rounded-full border px-3 text-sm font-semibold transition-colors pointer-coarse:h-11",
                      on ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted"
                    )}
                  >
                    {x.label}
                  </button>
                )
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <label htmlFor={`${uid}-newtag`} className="sr-only">
                {app.form.newTag}
              </label>
              <input
                id={`${uid}-newtag`}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (newTag.trim()) {
                      const id = createTag(newTag)
                      setTags((cur) => (cur.includes(id) ? cur : [...cur, id]))
                      setNewTag("")
                    }
                  }
                }}
                placeholder={app.form.newTag}
                maxLength={32}
                className={cn(inputCls, "max-w-xs")}
              />
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={!newTag.trim()}
                onClick={() => {
                  const id = createTag(newTag)
                  setTags((cur) => (cur.includes(id) ? cur : [...cur, id]))
                  setNewTag("")
                }}
              >
                <PlusIcon aria-hidden="true" />
                {app.form.addTag}
              </Button>
            </div>
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${uid}-note`} className="text-sm font-bold">
              {k.note}
            </label>
            <textarea
              id={`${uid}-note`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
            <p className="text-xs text-muted-foreground">{app.form.noteHelp}</p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
              {k.cancel}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {k.save}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}

/* ------------------------------------------------------------------------ */

const LOG_ICON: Record<LogKind, LucideIcon> = {
  added: UserPlusIcon,
  met: CalendarClockIcon,
  payment_in: ArrowDownLeftIcon,
  payment_out: ArrowUpRightIcon,
  verified: BadgeCheckIcon,
  verify_expired: XCircleIcon,
  vouched: HandshakeIcon,
  published: MegaphoneIcon,
  unpublished: EyeOffIcon,
  trust_changed: ShieldHalfIcon,
  app_event: EyeIcon,
}

function LogCard({ contact: c }: { contact: Contact }) {
  const { app, locale } = useAppCopy()
  const k = app.contact
  const text = (e: LogEntry) =>
    t(k.logKinds[e.kind], {
      detail: e.detail ?? "",
      amount: e.amount ? formatAmount(e.amount.value, e.amount.token, locale) : "",
      level: e.kind === "trust_changed" && e.detail ? (app.trust.levels[e.detail as TrustLevel] ?? e.detail) : "",
    })
  return (
    <Card title={k.log}>
      {c.log.length === 0 ? (
        <p className="text-sm text-muted-foreground">{k.logEmpty}</p>
      ) : (
        <ol className="relative flex flex-col gap-4 border-l pl-5">
          {c.log.map((e) => {
            const Icon = LOG_ICON[e.kind]
            return (
              <li key={e.id} className="relative">
                <span className="absolute top-0.5 -left-[31px] flex size-5 items-center justify-center rounded-full border bg-card">
                  <Icon
                    className={cn("size-3", e.kind === "verify_expired" ? "text-destructive" : e.kind === "verified" || e.kind === "vouched" ? "text-primary" : "text-foreground")}
                    aria-hidden="true"
                  />
                </span>
                <p className="text-sm font-semibold">
                  {text(e)}
                  {e.app ? <span className="font-normal text-muted-foreground"> · {t(k.via, { app: app.apps.meta[e.app].name })}</span> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  <time dateTime={e.at}>{formatDateTime(e.at, locale)}</time>
                  {e.hash ? (
                    <span className="ml-2 font-mono" title={e.hash}>
                      {shortHash(e.hash)}
                    </span>
                  ) : null}
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}

/* ------------------------------------------------------------------------ */

function VisibilityCard({ contact: c }: { contact: Contact }) {
  const demo = useDemo() as DemoState
  const { app, disclaimer, close } = useAppCopy()
  const k = app.contact
  const tx = useTx()
  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState<Visibility>(c.visibility)
  const [circleId, setCircleId] = useState(c.circleId ?? demo.circles[0]?.id ?? "")
  const circle = demo.circles.find((x) => x.id === c.circleId)
  const label = (v: Visibility, cid?: string) => {
    const circ = demo.circles.find((x) => x.id === cid)
    return v === "circle" && circ ? t(app.visibility.withCircle, { circle: circ.name }) : app.visibility.levels[v]
  }
  const Icon = VISIBILITY_ICON[c.visibility]

  const apply = async () => {
    setOpen(false)
    if (choice === c.visibility && (choice !== "circle" || circleId === c.circleId)) return
    const outcome = await tx.run(
      {
        title: k.publishPrompt.title,
        rows: [
          { label: k.publishPrompt.from, value: label(c.visibility, c.circleId) },
          { label: k.publishPrompt.to, value: label(choice, circleId) },
        ],
      },
      (hash) => changeVisibility(c.id, choice, circleId, hash)
    )
    if (outcome === "confirmed") toast.success(k.visibilityChanged, { description: label(choice, circleId) })
  }

  return (
    <Card title={k.visibility}>
      <p className="flex items-center gap-2 font-bold">
        <Icon className="size-4" aria-hidden="true" />
        {c.visibility === "circle" && circle ? t(app.visibility.withCircle, { circle: circle.name }) : app.visibility.levels[c.visibility]}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{app.visibility.help[c.visibility]}</p>
      {c.cid ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {k.cidLabel}:{" "}
          <span className="font-mono break-all text-foreground" title={c.cid}>
            {c.cid.slice(0, 14)}…{c.cid.slice(-6)}
          </span>
        </p>
      ) : null}
      {tx.state.phase === "idle" || tx.state.phase === "failed" || tx.state.phase === "confirmed" ? (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setChoice(c.visibility)
            setCircleId(c.circleId ?? demo.circles[0]?.id ?? "")
            tx.reset()
            setOpen(true)
          }}
        >
          {k.change}
        </Button>
      ) : null}
      <TxFeedback state={tx.state} onRetry={() => void apply()} onDismiss={tx.reset} className="mt-3" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent closeLabel={close} className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-lg">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-extrabold">{t(k.changeTitle, { name: c.name })}</DialogTitle>
            <DialogDescription>{k.changeBody}</DialogDescription>
          </DialogHeader>
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{app.visibility.label}</legend>
            {(["private", "circle", "public"] as const).map((v) => {
              const VIcon = VISIBILITY_ICON[v]
              return (
                <label
                  key={v}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
                    choice === v ? "border-foreground bg-secondary/60" : "hover:bg-muted/60"
                  )}
                >
                  <input type="radio" name="vis" value={v} checked={choice === v} onChange={() => setChoice(v)} className="mt-1 size-4 accent-[var(--foreground)]" />
                  <span>
                    <span className="flex items-center gap-2 font-bold">
                      <VIcon className="size-4" aria-hidden="true" />
                      {app.visibility.levels[v]}
                    </span>
                    <span className="text-sm text-muted-foreground">{app.visibility.help[v]}</span>
                  </span>
                </label>
              )
            })}
          </fieldset>
          {choice === "circle" ? (
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              {app.form.circle}
              <select
                value={circleId}
                onChange={(e) => setCircleId(e.target.value)}
                className="h-11 rounded-full border border-input bg-background px-4 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {demo.circles.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <Disclaimer text={disclaimer} />
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {k.cancel}
            </Button>
            <Button onClick={() => void apply()}>{k.apply}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function DangerCard({ contact: c }: { contact: Contact }) {
  const { app, locale, close } = useAppCopy()
  const k = app.contact
  const router = useRouter()
  const tx = useTx()
  const [open, setOpen] = useState(false)
  const published = c.visibility !== "private"

  const remove = async () => {
    setOpen(false)
    const done = () => {
      deleteContact(c.id)
      toast.success(t(k.deleted, { name: c.name }))
      router.push(href(locale, "/app"))
    }
    if (!published) return done()
    let confirmed = false
    await tx.run({ title: k.deletePrompt.title, rows: [{ label: k.deletePrompt.contact, value: c.name }] }, () => {
      confirmed = true
    })
    if (confirmed) done()
  }

  return (
    <Card title={k.danger}>
      <Button variant="destructive" onClick={() => setOpen(true)} disabled={tx.busy}>
        {tx.busy ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <Trash2Icon aria-hidden="true" />}
        {k.delete}
      </Button>
      <TxFeedback state={tx.state} onRetry={() => void remove()} onDismiss={tx.reset} hideConfirmed className="mt-3" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent closeLabel={close} className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-extrabold">{t(k.deleteTitle, { name: c.name })}</DialogTitle>
            <DialogDescription>{published ? k.deletePublished : k.deletePrivate}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} autoFocus>
              {k.cancel}
            </Button>
            <Button variant="destructive" onClick={() => void remove()}>
              <Trash2Icon aria-hidden="true" />
              {k.deleteConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
