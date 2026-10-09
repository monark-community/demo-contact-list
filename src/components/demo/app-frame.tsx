"use client"

import { AppWindowIcon, ContactIcon, Loader2Icon, LockKeyholeIcon, ScanSearchIcon, WalletIcon, XCircleIcon, type LucideIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { toast } from "sonner"

import { AppLoading } from "@/components/ui/app-loading"
import { AppTabs } from "@/components/ui/app-tabs"
import { Button } from "@/components/ui/button"
import { DemoControls } from "@/components/ui/demo-controls"
import { Skeleton } from "@/components/ui/skeleton"
import { href } from "@/i18n/config"
import { resetDemo, setSettings, useDemo, usePrompt, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"

import { useAppCopy } from "./app-provider"

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
        {!demo ? <ListSkeleton label={app.loading} /> : !connected ? <UnlockGate /> : children}
      </div>
    </div>
  )
}

function AppBar({ connected }: { connected: boolean }) {
  const { app, locale } = useAppCopy()
  const pathname = usePathname() ?? ""
  const base = href(locale, "/app")
  const tab = (path: string, label: string, short: string, Icon: LucideIcon, active: boolean) => ({
    href: `${base}${path}`,
    label: (
      <>
        <span className="sm:hidden">{short}</span>
        <span className="hidden sm:inline">{label}</span>
      </>
    ),
    icon: <Icon />,
    iconDesktopOnly: true,
    active,
  })
  const tabs = connected
    ? [
        tab("", app.tabs.contacts, app.tabs.contacts, ContactIcon, pathname === base || pathname.startsWith(`${base}/contacts`) || pathname === `${base}/new`),
        tab("/check", app.tabs.check, app.tabs.checkShort, ScanSearchIcon, pathname.startsWith(`${base}/check`)),
        tab("/apps", app.tabs.apps, app.tabs.appsShort, AppWindowIcon, pathname.startsWith(`${base}/apps`)),
      ]
    : []
  return <AppTabs tabs={tabs} pathname={pathname} LinkComponent={Link} label={app.tabs.label} actions={<AppDemoControls />} />
}

/** The app bar's one demo element: the (simulated) network, opening the demo controls. */
function AppDemoControls() {
  const demo = useDemo()
  const { app, seed, locale, close } = useAppCopy()
  const c = app.demo
  if (!demo) return null
  return (
    <DemoControls
      networkName={app.network}
      openLabel={c.open}
      title={c.title}
      slow={demo.settings.slow}
      onSlowChange={(v) => setSettings({ slow: v })}
      slowLabel={c.slow}
      slowHint={c.slowHelp}
      failNext={demo.settings.failNext}
      onFailNextChange={(v) => setSettings({ failNext: v })}
      failNextLabel={c.failNext}
      failNextHint={c.failNextHelp}
      onReset={() => {
        resetDemo(seed, locale)
        toast.success(c.resetDone)
      }}
      resetLabel={c.reset}
      resetHint={c.resetHelp}
      resetConfirmTitle={c.resetConfirm}
      resetConfirmBody={c.resetConfirmBody}
      resetConfirmLabel={c.resetDo}
      cancelLabel={c.cancel}
      closeLabel={close}
    />
  )
}

/** The contact list's shape: title, search pill, rows. */
function ListSkeleton({ label }: { label: string }) {
  return (
    <AppLoading label={label}>
      <Skeleton className="h-9 w-56 rounded-full" />
      <Skeleton className="h-11 w-full rounded-full" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </AppLoading>
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
        <Skeleton className="h-11 w-full rounded-full" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex h-20 items-center gap-4 rounded-2xl border px-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-40 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
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
