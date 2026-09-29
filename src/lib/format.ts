import { intlLocale, type Locale } from "@/i18n/config"

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium" }).format(new Date(iso))
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}

export function formatAmount(value: number, token: string, locale: Locale): string {
  const n = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 2 }).format(value)
  return `${n} ${token}`
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale]).format(n)
}

export function shortAddress(address: string, start = 6, end = 4): string {
  return address.length > start + end + 1 ? `${address.slice(0, start)}…${address.slice(-end)}` : address
}

export function shortHash(hash: string, start = 8, end = 6): string {
  return hash.length > start + end + 1 ? `${hash.slice(0, start)}…${hash.slice(-end)}` : hash
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

/** "0x7a3f 91c0 4be2 …": groups of four hex characters after 0x, for reading addresses aloud or diffing. */
export function addressGroups(address: string): string[] {
  const hex = address.toLowerCase().replace(/^0x/, "")
  const out: string[] = []
  for (let i = 0; i < hex.length; i += 4) out.push(hex.slice(i, i + 4))
  return out
}
