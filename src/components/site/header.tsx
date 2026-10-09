"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { DemoChip } from "@/components/ui/demo-chip"
import { HeaderAction } from "@/components/ui/header-action"
import { LocaleSwitch } from "@/components/ui/locale-switch"
import { SiteBrand } from "@/components/ui/site-brand"
import { SiteHeader } from "@/components/ui/site-header"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { href, locales, switchLocalePath, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"
import { useDemo } from "@/lib/demo/store"
import { connectWallet, disconnectWallet } from "@/lib/demo/wallet"

export interface HeaderCopy {
  common: Pick<
    Dictionary["common"],
    "product" | "homeLabel" | "nav" | "launchDemo" | "menu" | "menuTitle" | "closeMenu" | "theme" | "language" | "demoChip" | "demoBadge"
  >
  wallet: Dictionary["app"]["wallet"]
  signIn: Dictionary["app"]["signIn"]
}

/**
 * The @monark/ui site shell wired to TrustList: Next.js links, the locale
 * switch keeping the current page, and the demo wallet as the primary action
 * inside the app.
 */
export function Header({ locale, copy }: { locale: Locale; copy: HeaderCopy }) {
  const c = copy.common
  const pathname = usePathname() ?? `/${locale}`
  const demo = useDemo()
  const appHref = href(locale, "/app")

  return (
    <SiteHeader
      pathname={pathname}
      LinkComponent={Link}
      brand={<SiteBrand name={c.product} href={href(locale)} aria-label={c.homeLabel} LinkComponent={Link} />}
      links={[
        { href: href(locale), label: c.nav.overview, exact: true },
        { href: href(locale, "/how-it-works"), label: c.nav.how },
        { href: appHref, label: c.nav.demo },
      ]}
      labels={{ nav: c.nav.label, openMenu: c.menu, closeMenu: c.closeMenu, menu: c.menuTitle }}
      actions={
        <>
          <DemoChip label={c.demoChip} description={c.demoBadge} />
          <LocaleSwitch
            locales={locales}
            current={locale}
            hrefFor={(l) => switchLocalePath(pathname, l)}
            labels={{ label: c.language.label, short: c.language.short, names: { en: c.language.en, fr: c.language.fr } }}
            LinkComponent={Link}
            linkProps={{ prefetch: false }}
          />
          <ThemeToggle label={c.theme.toggle} />
        </>
      }
      primaryAction={
        <HeaderAction
          appHref={appHref}
          pathname={pathname}
          launchLabel={c.launchDemo}
          LinkComponent={Link}
          loading={!demo}
          wallet={{
            status: demo?.wallet.status ?? "disconnected",
            address: demo?.wallet.address,
            name: demo?.wallet.name,
            connectLabel: copy.wallet.connect,
            connectingLabel: copy.wallet.connecting,
            disconnectLabel: copy.wallet.disconnect,
            onConnect: () =>
              void connectWallet({
                title: copy.signIn.title,
                rows: [{ label: copy.signIn.row, value: copy.signIn.value }],
                movesValue: false,
                noFee: true,
              }),
            onDisconnect: disconnectWallet,
          }}
        />
      }
    />
  )
}
