"use client"

import { ChevronRightIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useDemo } from "@/lib/demo/store"
import type { Contact, ContactKind, DemoState, TrustLevel } from "@/lib/demo/types"
import { shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { TagChip, TrustChip, VerifiedMark, VisibilityChip } from "./chips"
import { ContactsRail } from "./contacts-rail"

type KindFilter = "all" | ContactKind

const TRUST_ORDER: TrustLevel[] = ["trusted", "known", "unverified", "flagged"]

function matches(c: Contact, q: string, tagLabels: Map<string, string>): boolean {
  if (!q) return true
  const needle = q.toLowerCase().trim()
  const hay = [
    c.name,
    c.role,
    c.note,
    ...c.tags.map((id) => tagLabels.get(id) ?? ""),
    ...c.addresses.flatMap((a) => [a.address, a.purpose]),
  ]
    .join(" ")
    .toLowerCase()
  return hay.includes(needle)
}

export function ContactsView() {
  const demo = useDemo() as DemoState
  const { app, locale } = useAppCopy()
  const l = app.list
  const [q, setQ] = useState("")
  const [kind, setKind] = useState<KindFilter>("all")
  const [trust, setTrust] = useState<TrustLevel | "">("")
  const [tag, setTag] = useState("")

  const tagLabels = useMemo(() => new Map(demo.tags.map((x) => [x.id, x.label])), [demo.tags])
  const tagTone = useMemo(() => new Map(demo.tags.map((x) => [x.id, x.tone])), [demo.tags])
  const usedTags = useMemo(() => demo.tags.filter((x) => demo.contacts.some((c) => c.tags.includes(x.id))), [demo.tags, demo.contacts])

  const list = useMemo(
    () =>
      demo.contacts
        .filter((c) => (kind === "all" ? true : c.kind === kind))
        .filter((c) => (trust ? c.trust === trust : true))
        .filter((c) => (tag ? c.tags.includes(tag) : true))
        .filter((c) => matches(c, q, tagLabels))
        .sort((a, b) => {
          if ((a.kind === "self") !== (b.kind === "self")) return a.kind === "self" ? 1 : -1
          return b.updatedAt.localeCompare(a.updatedAt)
        }),
    [demo.contacts, kind, trust, tag, q, tagLabels]
  )

  const filtered = kind !== "all" || !!trust || !!tag
  const total = demo.contacts.length
  const clear = () => {
    setQ("")
    setKind("all")
    setTrust("")
    setTag("")
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
      <section aria-labelledby="list-title" className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 id="list-title" className="text-3xl font-extrabold tracking-display sm:text-4xl">
              {l.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{total === 1 ? l.countOne : t(l.count, { n: total })}</p>
          </div>
          <Button asChild size="lg">
            <Link href={href(locale, "/app/new")}>
              <PlusIcon aria-hidden="true" />
              {l.add}
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="relative">
            <label htmlFor="contact-search" className="sr-only">
              {l.searchLabel}
            </label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="contact-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={l.searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="h-12 w-full rounded-full border border-input bg-card pr-4 pl-11 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label={l.kindsLabel} className="flex flex-wrap gap-1.5">
              {(["all", "person", "org", "self"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors duration-150 pointer-coarse:h-11",
                    kind === k ? "border-foreground bg-foreground text-background" : "border-input text-foreground hover:bg-muted"
                  )}
                >
                  {l.kinds[k]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <SelectPill label={l.trustLabel} value={trust} onChange={(v) => setTrust(v as TrustLevel | "")}>
                <option value="">{l.anyTrust}</option>
                {TRUST_ORDER.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {app.trust.levels[lvl]}
                  </option>
                ))}
              </SelectPill>
              <SelectPill label={l.tagLabel} value={tag} onChange={setTag}>
                <option value="">{l.anyTag}</option>
                {usedTags.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </SelectPill>
            </div>
          </div>
        </div>

        <div aria-live="polite" className="mt-6">
          {list.length === 0 ? (
            <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed p-6 sm:p-8">
              <p className="max-w-[52ch] text-muted-foreground">
                {total === 0 ? l.emptyList : q ? t(l.emptySearch, { q }) : l.emptyFiltered}
              </p>
              {total === 0 ? (
                <Button asChild>
                  <Link href={href(locale, "/app/new")}>
                    <PlusIcon aria-hidden="true" />
                    {l.add}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" onClick={clear}>
                  <XIcon aria-hidden="true" />
                  {l.clear}
                </Button>
              )}
            </div>
          ) : (
            <ul className="flex flex-col divide-y overflow-hidden rounded-3xl border bg-card">
              {list.map((c) => (
                <li key={c.id}>
                  <ContactRow contact={c} tagLabels={tagLabels} tagTone={tagTone} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ContactsRail />
    </div>
  )
}

function SelectPill({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 max-w-[12rem] appearance-none truncate rounded-full border bg-card pr-8 pl-3.5 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/40 pointer-coarse:h-11",
          value ? "border-foreground" : "border-input"
        )}
      >
        {children}
      </select>
      <ChevronRightIcon className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 rotate-90 text-muted-foreground" aria-hidden="true" />
    </label>
  )
}

function ContactRow({
  contact: c,
  tagLabels,
  tagTone,
}: {
  contact: Contact
  tagLabels: Map<string, string>
  tagTone: Map<string, "positive" | "neutral" | "caution">
}) {
  const { app, locale } = useAppCopy()
  const l = app.list
  const main = c.addresses[0]
  const more = c.addresses.length - 1
  const visibilityLabel = c.visibility === "circle" ? app.visibility.levels.circle : app.visibility.levels[c.visibility]

  return (
    <Link
      href={href(locale, `/app/contacts/${c.id}`)}
      className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-offset-[-2px] sm:gap-4 sm:px-5"
    >
      {main ? <WalletAvatar address={main.address} size={40} /> : <span className="size-10 rounded-full bg-muted" />}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-bold">{c.name}</span>
          {c.verifiedAt ? <VerifiedMark label={l.verified} withText={false} /> : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">{c.role || (c.kind === "self" ? app.kinds.self : "")}</p>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          {main ? (
            <span className="font-mono text-xs text-muted-foreground tabular-nums" title={main.address}>
              {shortAddress(main.address)}
              {more > 0 ? <span className="ml-1.5 font-sans font-semibold">{t(l.moreAddresses, { n: more })}</span> : null}
            </span>
          ) : null}
          <span className="hidden flex-wrap gap-1 sm:flex">
            {c.tags.slice(0, 2).map((id) => (
              <TagChip key={id} label={tagLabels.get(id) ?? id} tone={tagTone.get(id)} />
            ))}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {c.kind !== "self" ? <TrustChip level={c.trust} label={app.trust.levels[c.trust]} /> : null}
        <VisibilityChip level={c.visibility} label={visibilityLabel} />
      </div>
      <ChevronRightIcon className="hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden="true" />
    </Link>
  )
}
