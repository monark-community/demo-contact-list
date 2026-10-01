"use client"

import { ArrowRightIcon, ScanSearchIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useDemo } from "@/lib/demo/store"
import type { DemoState } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"
import { AppMark } from "./app-mark"

/** Right rail of the contact list: quick check, circles, apps reading the list. */
export function ContactsRail() {
  const demo = useDemo() as DemoState
  const { app, locale } = useAppCopy()
  const r = app.rail
  const router = useRouter()
  const [value, setValue] = useState("")
  const connected = demo.apps.filter((a) => a.status === "connected")

  return (
    <aside className="flex flex-col gap-4 lg:pt-2" aria-label={r.checkTitle}>
      <form
        className="rounded-3xl border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault()
          const v = value.trim()
          router.push(href(locale, v ? `/app/check?address=${encodeURIComponent(v)}` : "/app/check"))
        }}
      >
        <h2 className="flex items-center gap-2 font-bold">
          <ScanSearchIcon className="size-4 text-primary" aria-hidden="true" />
          {r.checkTitle}
        </h2>
        <label htmlFor="rail-check" className="sr-only">
          {r.checkLabel}
        </label>
        <input
          id="rail-check"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0x…"
          autoComplete="off"
          spellCheck={false}
          className="mt-3 h-11 w-full rounded-full border border-input bg-background px-4 font-mono text-sm outline-none placeholder:font-sans placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
        <Button type="submit" variant="outline" className="mt-2 w-full">
          {r.checkCta}
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </form>

      <section className="rounded-3xl border bg-card p-5" aria-labelledby="rail-circles">
        <h2 id="rail-circles" className="font-bold">
          {r.circlesTitle}
        </h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {demo.circles.map((c) => (
            <li key={c.id} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                <UsersIcon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold">{c.name}</span>
                <span className="text-xs text-muted-foreground">{t(r.members, { n: c.members })}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border bg-card p-5" aria-labelledby="rail-apps">
        <h2 id="rail-apps" className="font-bold">
          {r.appsTitle}
        </h2>
        {connected.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{r.appsNone}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2.5">
            {connected.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <AppMark id={a.id} />
                <span className="min-w-0 leading-tight">
                  <span className="block text-sm font-semibold">{app.apps.meta[a.id].name}</span>
                  <span className="text-xs text-muted-foreground">{a.scopes.map((s) => app.apps.scopeShort[s]).join(" · ")}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={href(locale, "/app/apps")}
          className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-ink underline underline-offset-4 lg:min-h-0"
        >
          {r.manage}
        </Link>
      </section>
    </aside>
  )
}
