"use client"

import { CheckCircle2Icon, InfoIcon, Loader2Icon, LockIcon, OctagonAlertIcon, PlusIcon, TriangleAlertIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useId, useMemo, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { sleep, useTx } from "@/lib/demo/chain"
import { checkAddress } from "@/lib/demo/check"
import { addContact, createTag, type NewContact } from "@/lib/demo/ops"
import { getDemo, useDemo } from "@/lib/demo/store"
import type { ContactKind, DemoState, TrustLevel, Visibility } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { TrustChip, VISIBILITY_ICON } from "./chips"
import { TxFeedback } from "./tx-feedback"

const TRUST: TrustLevel[] = ["trusted", "known", "unverified", "flagged"]
const VIS: Visibility[] = ["private", "circle", "public"]

export function ContactForm() {
  const demo = useDemo() as DemoState
  const { app, locale } = useAppCopy()
  const f = app.form
  const router = useRouter()
  const params = useSearchParams()
  const uid = useId()
  const tx = useTx()

  const [address, setAddress] = useState(() => params?.get("address") ?? "")
  const [kind, setKind] = useState<ContactKind>("person")
  const [name, setName] = useState(() => params?.get("name") ?? "")
  const [role, setRole] = useState("")
  const [purpose, setPurpose] = useState("")
  const [met, setMet] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [trust, setTrust] = useState<TrustLevel>("unverified")
  const [note, setNote] = useState("")
  const [visibility, setVisibility] = useState<Visibility>("private")
  const [circleId, setCircleId] = useState(demo.circles[0]?.id ?? "")
  const [ack, setAck] = useState(false)
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const addressRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const ackRef = useRef<HTMLInputElement>(null)

  const trimmed = address.trim()
  const check = useMemo(() => (trimmed ? checkAddress(trimmed, demo) : null), [trimmed, demo])
  const showAddressState = touched || submitted || trimmed.length >= 42

  const addressError = !trimmed
    ? f.errors.addressRequired
    : check?.verdict === "invalid"
      ? f.errors.addressInvalid
      : check?.contact
        ? t(f.errors.duplicate, { name: check.contact.name })
        : null
  const needsAck = check?.reason === "lookalike"
  const nameError = name.trim() ? null : f.errors.nameRequired
  const ackError = needsAck && !ack ? f.errors.ackRequired : null
  const publishes = visibility !== "private"
  const busy = saving || tx.busy

  const submit = async () => {
    setSubmitted(true)
    if (addressError) return addressRef.current?.focus()
    if (ackError) return ackRef.current?.focus()
    if (nameError) return nameRef.current?.focus()
    const input: NewContact = {
      kind,
      name,
      role,
      address: trimmed,
      purpose,
      tags,
      trust,
      note,
      visibility,
      circleId: visibility === "circle" ? circleId : undefined,
      met: met.trim() || undefined,
    }
    if (!publishes) {
      setSaving(true)
      const slow = getDemo()?.settings.slow ? 2 : 1
      await sleep(Math.round((600 + Math.random() * 400) * slow))
      const id = addContact(input)
      toast.success(f.saved, { description: name.trim() })
      router.push(href(locale, `/app/contacts/${id}`))
      return
    }
    const circle = demo.circles.find((c) => c.id === circleId)
    let createdId = ""
    const outcome = await tx.run(
      {
        title: f.prompt.title,
        rows: [
          { label: f.prompt.contact, value: name.trim() },
          { label: f.prompt.visibility, value: visibility === "circle" ? t(app.visibility.withCircle, { circle: circle?.name ?? "" }) : app.visibility.levels.public },
          { label: f.prompt.storage, value: f.prompt.storageValue },
        ],
      },
      (hash) => {
        createdId = addContact(input, hash)
      }
    )
    // No toast: the contact page opens with its content ID and the confirmed transaction.
    if (outcome === "confirmed" && createdId) {
      router.push(href(locale, `/app/contacts/${createdId}`))
    }
  }

  const addNewTag = () => {
    const label = newTag.trim()
    if (!label) return
    const id = createTag(label)
    setTags((x) => (x.includes(id) ? x : [...x, id]))
    setNewTag("")
  }

  return (
    <form
      noValidate
      aria-labelledby="form-title"
      className="mx-auto w-full max-w-3xl"
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <Link href={href(locale, "/app")} className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        ← {app.contact.back}
      </Link>
      <h1 id="form-title" className="mt-3 text-3xl font-extrabold tracking-display sm:text-4xl">
        {f.title}
      </h1>

      <div className="mt-8 flex flex-col gap-6">
        <Section title={f.sections.address}>
          <Field id={`${uid}-address`} label={f.address} error={showAddressState && addressError && !check?.contact ? addressError : null}>
            <input
              ref={addressRef}
              id={`${uid}-address`}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value)
                setAck(false)
              }}
              onBlur={() => setTouched(true)}
              placeholder="0x…"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={showAddressState && !!addressError}
              aria-describedby={`${uid}-address-check`}
              className={inputCls("font-mono")}
            />
          </Field>
          <div id={`${uid}-address-check`} aria-live="polite">
            {showAddressState && check && check.verdict !== "invalid" ? (
              check.contact ? (
                <Notice tone="danger" icon={OctagonAlertIcon}>
                  {t(f.errors.duplicate, { name: check.contact.name })}{" "}
                  <Link href={href(locale, `/app/contacts/${check.contact.id}`)} className="font-bold underline underline-offset-4">
                    {t(f.checks.openExisting, { name: check.contact.name })}
                  </Link>
                </Notice>
              ) : check.lookalike ? (
                <Notice tone="danger" icon={OctagonAlertIcon}>
                  <span className="block">{t(f.checks.lookalike, { name: check.lookalike.contact.name, n: check.lookalike.differing })}</span>
                  <label className="mt-2 flex items-start gap-2 font-semibold">
                    <input
                      ref={ackRef}
                      type="checkbox"
                      checked={ack}
                      onChange={(e) => setAck(e.target.checked)}
                      className="mt-1 size-4 accent-[var(--destructive)]"
                      aria-invalid={submitted && !!ackError}
                    />
                    {f.checks.ack}
                  </label>
                  {submitted && ackError ? <span className="mt-1 block font-bold">{ackError}</span> : null}
                </Notice>
              ) : check.directory?.kind === "flagged" ? (
                <Notice tone="danger" icon={TriangleAlertIcon}>
                  {t(f.checks.circleFlagged, { count: check.directory.count, circle: demo.circles.find((c) => c.id === check.directory?.circleId)?.name ?? "" })}
                </Notice>
              ) : check.directory ? (
                <Notice tone="info" icon={InfoIcon}>
                  {t(f.checks.circleKnown, {
                    count: check.directory.count,
                    circle: demo.circles.find((c) => c.id === check.directory?.circleId)?.name ?? "",
                    name: check.directory.name,
                  })}
                </Notice>
              ) : (
                <Notice tone="ok" icon={CheckCircle2Icon}>
                  {f.checks.valid}
                </Notice>
              )
            ) : null}
          </div>
        </Section>

        <Section title={f.sections.who}>
          <fieldset>
            <legend className="text-sm font-bold">{f.kind}</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(["person", "org", "self"] as const).map((k) => (
                <label
                  key={k}
                  className={cn(
                    "inline-flex h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/40 pointer-coarse:h-11",
                    kind === k ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted"
                  )}
                >
                  <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
                  {app.kinds[k]}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={`${uid}-name`} label={f.name} error={submitted ? nameError : null}>
              <input
                ref={nameRef}
                id={`${uid}-name`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={f.namePlaceholder}
                aria-invalid={submitted && !!nameError}
                className={inputCls()}
              />
            </Field>
            <Field id={`${uid}-role`} label={f.role}>
              <input id={`${uid}-role`} value={role} onChange={(e) => setRole(e.target.value)} placeholder={f.rolePlaceholder} className={inputCls()} />
            </Field>
            <Field id={`${uid}-purpose`} label={f.purpose}>
              <input id={`${uid}-purpose`} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder={f.purposePlaceholder} className={inputCls()} />
            </Field>
            <Field id={`${uid}-met`} label={f.met}>
              <input id={`${uid}-met`} value={met} onChange={(e) => setMet(e.target.value)} placeholder={f.metPlaceholder} className={inputCls()} />
            </Field>
          </div>
        </Section>

        <Section title={f.sections.tags}>
          <div role="group" aria-label={f.sections.tags} className="flex flex-wrap gap-1.5">
            {demo.tags.map((x) => {
              const on = tags.includes(x.id)
              return (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTags((cur) => (on ? cur.filter((y) => y !== x.id) : [...cur, x.id]))}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors pointer-coarse:h-11",
                    on ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted"
                  )}
                >
                  {x.label}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <label htmlFor={`${uid}-newtag`} className="sr-only">
              {f.newTag}
            </label>
            <input
              id={`${uid}-newtag`}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addNewTag()
                }
              }}
              placeholder={f.newTag}
              maxLength={32}
              className={inputCls("max-w-xs")}
            />
            <Button type="button" variant="outline" onClick={addNewTag} disabled={!newTag.trim()} className="h-11">
              <PlusIcon aria-hidden="true" />
              {f.addTag}
            </Button>
          </div>
        </Section>

        <Section title={f.sections.trust} info={<TrustHelp />}>
          <fieldset>
            <legend className="sr-only">{app.trust.label}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TRUST.map((lvl) => (
                <label
                  key={lvl}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
                    trust === lvl ? "border-foreground bg-secondary/60" : "hover:bg-muted/60"
                  )}
                >
                  <input type="radio" name="trust" value={lvl} checked={trust === lvl} onChange={() => setTrust(lvl)} className="size-4 accent-[var(--foreground)]" />
                  <TrustChip level={lvl} label={app.trust.levels[lvl]} className="self-start" />
                </label>
              ))}
            </div>
          </fieldset>
        </Section>

        <Section title={f.sections.note} aside={f.noteHelp}>
          <Field id={`${uid}-note`} label={f.sections.note} hideLabel>
            <textarea
              id={`${uid}-note`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={f.notePlaceholder}
              rows={3}
              className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </Field>
        </Section>

        <Section title={f.sections.visibility}>
          <fieldset>
            <legend className="sr-only">{app.visibility.label}</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {VIS.map((v) => {
                const Icon = VISIBILITY_ICON[v]
                return (
                  <label
                    key={v}
                    className={cn(
                      "flex cursor-pointer flex-col gap-1.5 rounded-2xl border p-3.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
                      visibility === v ? "border-foreground bg-secondary/60" : "hover:bg-muted/60"
                    )}
                  >
                    <span className="flex items-center gap-2 font-bold">
                      <input type="radio" name="visibility" value={v} checked={visibility === v} onChange={() => setVisibility(v)} className="size-4 accent-[var(--foreground)]" />
                      <Icon className="size-4" aria-hidden="true" />
                      {app.visibility.levels[v]}
                    </span>
                    <span className="text-sm text-muted-foreground">{app.visibility.help[v]}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
          {visibility === "circle" ? (
            <Field id={`${uid}-circle`} label={f.circle}>
              <select id={`${uid}-circle`} value={circleId} onChange={(e) => setCircleId(e.target.value)} className={inputCls("max-w-sm")}>
                {demo.circles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
        </Section>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t bg-background/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
        <TxFeedback
          state={tx.state}
          pendingLabel={f.publishing}
          failedLabel={f.publishFailed}
          onRetry={() => void submit()}
          onDismiss={tx.reset}
          hideConfirmed
          className="mb-3"
        />
        {saving ? (
          <p role="status" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
            <Loader2Icon className="size-4 animate-spin text-primary" aria-hidden="true" />
            {f.saving}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
            <Button asChild variant="outline" size="lg">
              <Link href={href(locale, "/app")}>{f.cancel}</Link>
            </Button>
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
              {publishes ? f.savePublish : f.save}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

function inputCls(extra = "") {
  return cn(
    "h-11 w-full rounded-full border border-input bg-card px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive",
    extra
  )
}

function Section({ title, info, aside, children }: { title: string; info?: ReactNode; aside?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border bg-card p-5 sm:p-6">
      <div className="flex min-h-8 items-center gap-1.5">
        <h2 className="text-lg font-bold">{title}</h2>
        {info}
        {aside ? (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <LockIcon className="size-3.5" aria-hidden="true" />
            {aside}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  )
}

/** The four trust levels, explained on demand (info icon next to the section title). */
export function TrustHelp() {
  const { app } = useAppCopy()
  return (
    <InfoTip label={app.info}>
      <dl className="flex flex-col gap-2">
        {TRUST.map((lvl) => (
          <div key={lvl}>
            <dt className="font-bold">{app.trust.levels[lvl]}</dt>
            <dd className="text-muted-foreground">{app.trust.help[lvl]}</dd>
          </div>
        ))}
      </dl>
    </InfoTip>
  )
}

function Field({
  id,
  label,
  help,
  error,
  hideLabel,
  children,
}: {
  id: string
  label: string
  help?: string
  error?: string | null
  hideLabel?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cn("text-sm font-bold", hideLabel && "sr-only")}>
        {label}
      </label>
      {children}
      {help ? (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function Notice({ tone, icon: Icon, children }: { tone: "ok" | "info" | "danger"; icon: typeof InfoIcon; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-2xl border p-3 text-sm",
        tone === "danger" && "border-destructive/50 bg-destructive/5 text-destructive",
        tone === "info" && "border-border bg-secondary/60",
        tone === "ok" && "border-success/40 bg-success/5"
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", tone === "ok" && "text-success")} aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
