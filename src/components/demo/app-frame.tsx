"use client"

import { AppWindowIcon, ContactIcon, KeyRoundIcon, Loader2Icon, LockKeyholeIcon, ScanSearchIcon, WalletIcon, XCircleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { NetworkBadge } from "@/components/ui/network-badge"
import { href } from "@/i18n/config"
import { useDemo, usePrompt, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"
import { Disclaimer } from "./disclaimer"

/** App chrome under the site header: network, disclaimer, demo controls, section tabs; gates on sign-in. */
export function AppFrame({ children }: { children: ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app, disclaimer } = useAppCopy()
  const connected = demo?.wallet.status === "connected"

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
          <NetworkBadge name={app.network} variant="outline" icon={<span className="block size-full rounded-full bg-success" />} />
          <Disclaimer text={disclaimer} className="order-last min-w-0 basis-full sm:order-none sm:basis-auto sm:flex-1" />
          <div className="ml-auto sm:ml-0">
            <DemoControls />
          </div>
        </div>
      </div>
      {!storageOk ? (
        <p role="alert" className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm text-warning sm:px-6">
          {app.demo.storage}
        </p>
      ) : null}
      {connected ? <AppTabs /> : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-10">
        {!demo ? <AppLoading label={app.loading} /> : !connected ? <UnlockGate /> : children}
      </div>
    </div>
  )
}

function AppTabs() {
  const { app, locale } = useAppCopy()
  const pathname = usePathname() ?? ""
  const base = href(locale, "/app")
  const tabs = [
    { href: base, label: app.tabs.contacts, icon: ContactIcon, active: pathname === base || pathname.startsWith(`${base}/contacts`) || pathname === `${base}/new` },
    { href: `${base}/check`, label: app.tabs.check, icon: ScanSearchIcon, active: pathname.startsWith(`${base}/check`) },
    { href: `${base}/apps`, label: app.tabs.apps, icon: AppWindowIcon, active: pathname.startsWith(`${base}/apps`) },
  ]
  return (
    <nav aria-label={app.tabs.label} className="border-b">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 [scrollbar-width:none]">
        {tabs.map((t) => (
          <li key={t.href} className="shrink-0">
            <Link
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-150",
                t.active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <t.icon className="size-4" aria-hidden="true" />
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
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
      <ul className="mt-6 flex flex-col gap-2.5 text-left text-sm">
        {g.points.map((f, i) => {
          const Icon = [KeyRoundIcon, LockKeyholeIcon, WalletIcon][i] ?? KeyRoundIcon
          return (
            <li key={f} className="flex items-start gap-2.5">
              <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {f}
            </li>
          )
        })}
      </ul>
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
