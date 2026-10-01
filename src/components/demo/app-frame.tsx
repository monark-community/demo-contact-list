"use client"

import { AppWindowIcon, ContactIcon, Loader2Icon, LockKeyholeIcon, ScanSearchIcon, WalletIcon, XCircleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { useDemo, usePrompt, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"

/**
 * App chrome under the site header: ONE compact bar with the section tabs on
 * the left and a single pill (network + demo controls) on the right. No
 * testnet strip: that line lives in the wallet prompt, once per transaction.
 * Gates on sign-in.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app } = useAppCopy()
  const connected = demo?.wallet.status === "connected"

  return (
    <div className="flex flex-1 flex-col">
      <AppBar connected={connected} />
      {!storageOk ? (
        <p role="alert" className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm text-warning sm:px-6">
          {app.demo.storage}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-10">
        {!demo ? <AppLoading label={app.loading} /> : !connected ? <UnlockGate /> : children}
      </div>
    </div>
  )
}

function AppBar({ connected }: { connected: boolean }) {
  const { app, locale } = useAppCopy()
  const pathname = usePathname() ?? ""
  const base = href(locale, "/app")
  const tabs = [
    { href: base, label: app.tabs.contacts, short: app.tabs.contacts, icon: ContactIcon, active: pathname === base || pathname.startsWith(`${base}/contacts`) || pathname === `${base}/new` },
    { href: `${base}/check`, label: app.tabs.check, short: app.tabs.checkShort, icon: ScanSearchIcon, active: pathname.startsWith(`${base}/check`) },
    { href: `${base}/apps`, label: app.tabs.apps, short: app.tabs.appsShort, icon: AppWindowIcon, active: pathname.startsWith(`${base}/apps`) },
  ]
  return (
    <div className="border-b bg-secondary/40">
      <div className="mx-auto flex min-h-13 max-w-6xl items-center gap-2 px-4 sm:px-6">
        {connected ? (
          <nav aria-label={app.tabs.label} className="min-w-0 flex-1">
            <ul className="-mx-1 flex min-w-0 items-center gap-0.5 overflow-x-auto px-1 py-2 [scrollbar-width:none] sm:gap-1">
              {tabs.map((t) => (
                <li key={t.href} className="shrink-0">
                  <Link
                    href={t.href}
                    aria-current={t.active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold transition-colors duration-150 sm:gap-2 sm:px-3.5",
                      t.active ? "bg-card text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <t.icon className="hidden size-4 sm:block" aria-hidden="true" />
                    <span className="sm:hidden">{t.short}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <div className="flex-1" />
        )}
        <div className="shrink-0">
          <DemoControls />
        </div>
      </div>
    </div>
  )
}

export function AppLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      <div className="h-9 w-56 animate-pulse rounded-full bg-muted" />
      <div className="h-11 w-full animate-pulse rounded-full bg-muted" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  )
}

function UnlockGate() {
  const demo = useDemo()
  const prompt = usePrompt()
  const { app } = useAppCopy()
  const g = app.gate
  const connecting = demo?.wallet.status === "connecting"
  const decrypting = connecting && !prompt
  const rejected = demo?.wallet.lastError === "rejected"

  if (decrypting) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-4">
        <p className="inline-flex items-center gap-2 font-semibold">
          <Loader2Icon className="size-4 animate-spin text-primary" aria-hidden="true" />
          {g.decrypting}
        </p>
        <div className="h-11 w-full animate-pulse rounded-full bg-muted" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex h-20 items-center gap-4 rounded-2xl border px-4">
            <div className="size-10 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3.5 w-40 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section aria-labelledby="gate-title" className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center py-8 text-center">
      <div className="relative">
        <Image src="/brand/monark-mark.svg" alt="" width={56} height={56} unoptimized className="size-14" />
        <span className="absolute -right-2 -bottom-1 flex size-7 items-center justify-center rounded-full border bg-card">
          <LockKeyholeIcon className="size-3.5 text-foreground" aria-hidden="true" />
        </span>
      </div>
      <h1 id="gate-title" className="mt-6 text-3xl font-extrabold tracking-display">
        {g.title}
      </h1>
      <p className="mt-3 text-muted-foreground">{g.body}</p>
      <Button
        size="lg"
        className="mt-8 w-full sm:w-auto"
        disabled={connecting}
        onClick={() =>
          void connectWallet({
            title: app.signIn.title,
            rows: [{ label: app.signIn.row, value: app.signIn.value }],
            noFee: true,
          })
        }
      >
        {connecting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <WalletIcon aria-hidden="true" />}
        {connecting ? g.waiting : g.cta}
      </Button>
      <div aria-live="polite" className="mt-4 min-h-6">
        {rejected ? (
          <p role="alert" className="flex items-start gap-2 text-left text-sm text-destructive">
            <XCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {g.rejected}
          </p>
        ) : null}
      </div>
    </section>
  )
}
