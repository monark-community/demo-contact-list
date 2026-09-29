import { ArrowRightIcon, BadgeCheckIcon, GlobeIcon, HandshakeIcon, LinkIcon, LockIcon, ShieldHalfIcon, SmartphoneIcon, UsersIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { TagChip, TrustChip, VerifiedMark, VisibilityChip } from "@/components/demo/chips"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { WalletAvatar } from "@/components/ui/wallet"
import { href, isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { ADDR } from "@/lib/demo/addresses"
import { shortAddress } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.how
  return pageMetadata(locale, "/how-it-works", m.title, m.description)
}

const TIER_ICONS = [SmartphoneIcon, UsersIcon, GlobeIcon]
const SIGNAL_ICONS = [ShieldHalfIcon, BadgeCheckIcon, HandshakeIcon]

function code(inside: string, notes: string, purpose: string) {
  return `// ${inside}
const names = await trustlist.resolve([
  "${ADDR.malik}",
  "${ADDR.drainer}",
], { scopes: ["names", "trust", "warnings"] })

// → [
//   { name: "Malik Haddad", purpose: "${purpose}",
//     trust: "known", verified: false },
//   { warning: "flagged", source: "circle" },
// ]
// ${notes}`
}

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.how
  const a = h.anatomy
  const parts = [a.parts.addresses, a.parts.tags, a.parts.trust, a.parts.signals, a.parts.note, a.parts.visibility]

  return (
    <div className="flex flex-col">
      {/* Intro */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-12 sm:px-6 lg:pt-20" aria-labelledby="how-title">
        <p className="eyebrow text-primary-ink">{h.eyebrow}</p>
        <h1 id="how-title" className="mt-4 max-w-3xl text-4xl font-extrabold tracking-display sm:text-5xl">
          {h.title}
        </h1>
        <p className="mt-5 max-w-[62ch] text-lg text-muted-foreground">{h.intro}</p>
      </section>

      {/* Anatomy */}
      <section className="border-y bg-card/60" aria-labelledby="anatomy-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:py-20">
          <div>
            <h2 id="anatomy-title" className="text-3xl font-bold tracking-display">
              {a.title}
            </h2>
            <p className="mt-3 max-w-[56ch] text-muted-foreground">{a.body}</p>
            <ol className="mt-8 grid gap-5 sm:grid-cols-2">
              {parts.map((p, i) => (
                <li key={p.title} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-extrabold">{i + 1}</span>
                  <span>
                    <span className="block font-bold">{p.title}</span>
                    <span className="text-sm text-muted-foreground">{p.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <figure aria-label={a.label} className="rounded-3xl border bg-background p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <WalletAvatar address={ADDR.ines} size={48} />
              <div className="min-w-0">
                <p className="text-lg font-extrabold">{a.sample.name}</p>
                <p className="text-sm text-muted-foreground">{a.sample.role}</p>
              </div>
            </div>
            <Callout n={1}>
              <p className="text-sm font-semibold">{a.sample.purpose}</p>
              <p className="font-mono text-sm text-muted-foreground">{shortAddress(ADDR.ines, 10, 8)}</p>
            </Callout>
            <Callout n={2}>
              <div className="flex flex-wrap gap-1.5">
                {a.sample.tags.map((x) => (
                  <TagChip key={x} label={x} tone="positive" />
                ))}
              </div>
            </Callout>
            <Callout n={3}>
              <TrustChip level="trusted" label={dict.app.trust.levels.trusted} />
            </Callout>
            <Callout n={4}>
              <div className="flex flex-wrap items-center gap-3">
                <VerifiedMark label={dict.app.contact.verifiedBy} />
                <span className="text-xs font-semibold text-muted-foreground">{t(dict.app.contact.vouchesCount, { n: 7 })}</span>
              </div>
            </Callout>
            <Callout n={5}>
              <p className="flex items-start gap-2 rounded-2xl border border-dashed bg-muted/40 p-3 text-sm">
                <LockIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {a.sample.note}
              </p>
            </Callout>
            <Callout n={6}>
              <VisibilityChip level="circle" label={t(dict.app.visibility.withCircle, { circle: dict.seed.circles.campus })} />
            </Callout>
          </figure>
        </div>
      </section>

      {/* Storage tiers */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20" aria-labelledby="storage-title">
        <h2 id="storage-title" className="text-3xl font-bold tracking-display">
          {h.storage.title}
        </h2>
        <p className="mt-3 max-w-[60ch] text-muted-foreground">{h.storage.body}</p>
        <figure aria-label={h.storage.label} className="relative mt-10">
          <div className="absolute top-8 right-[16%] left-[16%] hidden h-0.5 bg-primary md:block" aria-hidden="true" />
          <ol className="relative grid gap-8 md:grid-cols-3">
            {(["private", "circle", "public"] as const).map((k, i) => {
              const Icon = TIER_ICONS[i] ?? LockIcon
              const tier = h.storage.tiers[k]
              return (
                <li key={k} className="flex flex-col items-start md:items-center md:text-center">
                  <span className="relative flex size-16 items-center justify-center rounded-full border-2 border-primary bg-background">
                    <Icon className="size-7" strokeWidth={1.75} aria-hidden="true" />
                    {k === "public" ? (
                      <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border bg-card">
                        <LinkIcon className="size-3.5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{tier.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">{dict.app.visibility.levels[k]}</p>
                  <p className="mt-2 max-w-[34ch] text-muted-foreground">{tier.body}</p>
                </li>
              )
            })}
          </ol>
        </figure>
        <p className="mt-8 text-sm text-muted-foreground">{h.storage.fee}</p>
      </section>

      <SectionDivider />

      {/* Trust signals */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20" aria-labelledby="trust-title">
        <h2 id="trust-title" className="max-w-2xl text-3xl font-bold tracking-display">
          {h.trust.title}
        </h2>
        <p className="mt-3 max-w-[60ch] text-muted-foreground">{h.trust.body}</p>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {h.trust.items.map((item, i) => {
            const Icon = SIGNAL_ICONS[i] ?? ShieldHalfIcon
            return (
              <li key={item.title} className="rounded-3xl border bg-card p-6">
                <Icon className="size-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.body}</p>
              </li>
            )
          })}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          {(["trusted", "known", "unverified", "flagged"] as const).map((lvl) => (
            <TrustChip key={lvl} level={lvl} label={dict.app.trust.levels[lvl]} />
          ))}
        </div>
      </section>

      {/* Check decision path */}
      <section className="border-y bg-card/60" aria-labelledby="check-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-20">
          <div>
            <h2 id="check-title" className="text-3xl font-bold tracking-display">
              {h.check.title}
            </h2>
            <p className="mt-3 max-w-[48ch] text-muted-foreground">{h.check.body}</p>
          </div>
          <figure aria-label={h.check.label}>
            <ol className="relative flex flex-col gap-6 border-l-2 border-primary pl-8">
              {h.check.steps.map((s, i) => (
                <li key={s.title} className="relative">
                  <span className="absolute top-0 -left-[45px] flex size-7 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-extrabold">
                    {i + 1}
                  </span>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </figure>
        </div>
      </section>

      {/* Developers */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20" aria-labelledby="dev-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2 id="dev-title" className="text-3xl font-bold tracking-display">
              {h.dev.title}
            </h2>
            <p className="mt-3 max-w-[56ch] text-muted-foreground">{h.dev.body}</p>
            <h3 className="mt-8 font-bold">{h.dev.scopesTitle}</h3>
            <dl className="mt-3 flex flex-col gap-3">
              {h.dev.scopes.map((s) => (
                <div key={s.name} className="flex gap-3">
                  <dt className="shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold">{s.name}</dt>
                  <dd className="text-sm text-muted-foreground">{s.body}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold">
              <LockIcon className="size-4 text-primary" aria-hidden="true" />
              {h.dev.never}
            </p>
          </div>
          <figure aria-label={h.dev.codeLabel} className="min-w-0">
            <pre className="overflow-x-auto rounded-3xl border bg-secondary/60 p-5 font-mono text-[0.8rem] leading-relaxed sm:text-sm">
              <code>{code(h.dev.codeInside, h.dev.codeNotes, dict.seed.mainWallet)}</code>
            </pre>
          </figure>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t" aria-labelledby="cta-title">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="cta-title" className="text-3xl font-bold tracking-display">
              {h.cta.title}
            </h2>
            <p className="mt-2 text-muted-foreground">{h.cta.body}</p>
          </div>
          <Button asChild size="lg">
            <Link href={href(locale, "/app/check")}>
              {h.cta.button}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function Callout({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-3 border-t pt-4">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary text-xs font-extrabold" aria-hidden="true">
        {n}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
