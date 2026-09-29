import { ArrowRightIcon, AppWindowIcon, ChevronDownIcon, OctagonAlertIcon, ScanSearchIcon, UserSearchIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { TagChip, TrustChip, VISIBILITY_ICON } from "@/components/demo/chips"
import { AddressDiff } from "@/components/diagrams/address-diff"
import { AppHub } from "@/components/diagrams/app-hub"
import { HeroCard, type HeroRow } from "@/components/home/hero-card"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { href, isLocale, type Locale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { ADDR, INES_LOOKALIKE } from "@/lib/demo/addresses"
import { diffAddresses } from "@/lib/demo/check"
import { formatAmount } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

import campusImg from "../../../public/images/campus.jpg"
import studioImg from "../../../public/images/studio.jpg"
import workingGroupImg from "../../../public/images/working-group.jpg"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return pageMetadata(locale, "/", null, getDictionary(locale).meta.description)
}

const OUTCOME_ICONS = [ScanSearchIcon, UserSearchIcon, AppWindowIcon]
const IMAGES = { campus: campusImg, workingGroup: workingGroupImg, studio: studioImg }

function heroRows(locale: Locale): HeroRow[] {
  const d = getDictionary(locale)
  const c = d.home.card
  const p = d.seed.people
  const lv = d.app.trust.levels
  const amt = (v: number, tok: string) => formatAmount(v, tok, locale)
  return [
    { address: ADDR.northbridge, direction: "in", text: t(c.rows.northbridge, { amount: amt(2500, "tUSDC") }), name: p.northbridge.name, role: p.northbridge.role, trust: "trusted", trustLabel: lv.trusted, verified: true },
    { address: ADDR.ines, direction: "out", text: t(c.rows.ines, { amount: amt(250, "tUSDC") }), name: p.ines.name, role: p.ines.role, trust: "trusted", trustLabel: lv.trusted, verified: true },
    { address: INES_LOOKALIKE, direction: "in", text: t(c.rows.lookalike, { amount: amt(0, "tETH") }), name: "", role: "", lookalikeOf: p.ines.name },
    { address: ADDR.malik, direction: "out", text: t(c.rows.malik, { amount: amt(420, "tUSDC") }), name: p.malik.name, role: p.malik.role, trust: "known", trustLabel: lv.known },
    { address: ADDR.cafe, direction: "out", text: t(c.rows.cafe, { amount: amt(184.5, "tUSDC") }), name: p.cafe.name, role: p.cafe.role, trust: "known", trustLabel: lv.known, verified: true },
  ]
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.home
  const differing = diffAddresses(ADDR.ines, INES_LOOKALIKE).filter(Boolean).length
  const inesName = dict.seed.people.ines.name

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <Image
          src="/brand/monark-mesh.svg"
          alt=""
          width={569}
          height={571}
          unoptimized
          priority
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-44 w-[34rem] max-w-none opacity-[0.10] select-none sm:-right-24 lg:-top-20 lg:-right-24 lg:w-[46rem] dark:opacity-[0.16]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pt-20 lg:pb-24">
          <div>
            <p className="eyebrow text-primary-ink">{h.eyebrow}</p>
            <h1 id="hero-title" className="mt-4 text-[2.25rem] leading-[1.08] font-extrabold tracking-display sm:text-5xl lg:text-[3.75rem]">
              {h.title}
            </h1>
            <p className="mt-5 max-w-[34rem] text-lg text-muted-foreground sm:text-xl">{h.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href={href(locale, "/app")}>
                  {h.ctaPrimary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/how-it-works")}>{h.ctaSecondary}</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">{dict.common.demoBadge}</p>
          </div>
          <HeroCard rows={heroRows(locale)} copy={h.card} />
        </div>
      </section>

      {/* Outcomes */}
      <section aria-labelledby="outcomes-title" className="border-t bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="outcomes-title" className="max-w-2xl text-3xl font-bold tracking-display sm:text-4xl">
            {h.outcomes.title}
          </h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {h.outcomes.items.map((o, i) => {
              const Icon = OUTCOME_ICONS[i] ?? ScanSearchIcon
              return (
                <li key={o.title}>
                  <Icon className="size-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-bold">{o.title}</h3>
                  <p className="mt-2 text-muted-foreground">{o.body}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Check before you send */}
      <section aria-labelledby="check-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14">
          <div>
            <p className="eyebrow text-primary-ink">{h.check.eyebrow}</p>
            <h2 id="check-title" className="mt-3 text-3xl font-bold tracking-display sm:text-4xl">
              {h.check.title}
            </h2>
            <p className="mt-4 max-w-[56ch] text-muted-foreground">{h.check.body}</p>
            <Button asChild variant="outline" size="lg" className="mt-7">
              <Link href={href(locale, "/app/check")}>
                <ScanSearchIcon aria-hidden="true" />
                {h.check.cta}
              </Link>
            </Button>
          </div>
          <div className="rounded-3xl border-2 border-destructive/50 bg-card p-5 sm:p-7">
            <p className="flex items-center gap-2 text-lg font-extrabold text-destructive">
              <OctagonAlertIcon className="size-5" aria-hidden="true" />
              {t(h.check.verdict, { name: inesName })}
            </p>
            <AddressDiff
              className="mt-5"
              real={ADDR.ines}
              pasted={INES_LOOKALIKE}
              realLabel={t(h.check.real, { name: inesName })}
              pastedLabel={h.check.fake}
              animate={false}
            />
            <p className="mt-4 text-sm font-bold text-destructive">{t(h.check.differ, { n: differing })}</p>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Private by default */}
      <section aria-labelledby="privacy-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 id="privacy-title" className="max-w-2xl text-3xl font-bold tracking-display sm:text-4xl">
          {h.privacy.title}
        </h2>
        <p className="mt-3 max-w-[60ch] text-muted-foreground">{h.privacy.intro}</p>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {(["private", "circle", "public"] as const).map((lvl) => {
            const Icon = VISIBILITY_ICON[lvl]
            const l = h.privacy.levels[lvl]
            const who = lvl === "private" ? h.privacy.whoPrivate : lvl === "circle" ? h.privacy.whoCircle : h.privacy.whoPublic
            return (
              <li key={lvl} className="flex flex-col rounded-3xl border bg-card p-6">
                <Icon className="size-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold">{l.title}</h3>
                <p className="mt-2 flex-1 text-muted-foreground">{l.body}</p>
                <dl className="mt-5 border-t pt-4 text-sm">
                  <dt className="text-xs font-semibold text-muted-foreground">{h.privacy.whoSees}</dt>
                  <dd className="font-bold">{who}</dd>
                </dl>
                <p className="mt-3 truncate text-xs text-muted-foreground">{l.example}</p>
              </li>
            )
          })}
        </ul>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-dashed px-4 py-2 text-sm font-semibold">{h.privacy.notes}</p>
      </section>

      {/* One list, every app */}
      <section aria-labelledby="apps-title" className="border-y bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="apps-title" className="text-3xl font-bold tracking-display sm:text-4xl">
              {h.apps.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{h.apps.body}</p>
          </div>
          <div className="mt-12">
            <AppHub label={h.apps.diagramLabel} yourList={h.apps.yourList} notesStay={h.apps.notesStay} scopes={h.apps.scopes} apps={h.apps.apps} />
          </div>
          <div className="mt-10 text-center">
            <Link href={href(locale, "/app/apps")} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary-ink underline underline-offset-4">
              {h.apps.cta}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Who keeps a TrustList */}
      <section aria-labelledby="who-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 id="who-title" className="text-3xl font-bold tracking-display sm:text-4xl">
          {h.who.title}
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {h.who.items.map((item, i) => {
            const photo = PHOTOS[i]
            const trust = i === 1 ? "known" : i === 0 ? "trusted" : "known"
            return (
              <li key={item.title} className="flex flex-col overflow-hidden rounded-3xl border bg-card">
                <div className="relative aspect-[4/3]">
                  {photo ? (
                    <Image
                      src={IMAGES[photo.key]}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      placeholder="blur"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{item.body}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-3">
                    <span className="w-full text-sm font-bold">{item.contact}</span>
                    <TagChip label={item.tag} />
                    <TrustChip level={trust} label={dict.app.trust.levels[trust]} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <SectionDivider />

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 id="faq-title" className="text-3xl font-bold tracking-display sm:text-4xl">
          {h.faq.title}
        </h2>
        <div className="mt-8 divide-y rounded-3xl border bg-card">
          {h.faq.items.map((f) => (
            <details key={f.q} className="group px-5 sm:px-6">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="max-w-[68ch] pb-5 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section aria-labelledby="closing-title" className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between lg:py-20">
          <div>
            <h2 id="closing-title" className="text-3xl font-bold tracking-display sm:text-4xl">
              {h.closing.title}
            </h2>
            <p className="mt-3 max-w-[52ch] text-muted-foreground">{h.closing.body}</p>
          </div>
          <Button asChild size="lg">
            <Link href={href(locale, "/app")}>
              {h.closing.cta}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
