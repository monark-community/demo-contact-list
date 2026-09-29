import type { Metadata } from "next"

import { ContactView } from "@/components/demo/contact-view"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { SEED_CONTACT_IDS } from "@/lib/demo/seed"
import { pageMetadata } from "@/lib/metadata"

// The example contacts are prerendered; contacts created in the browser render on demand
// (the page is a client shell that reads the contact from local demo state).
export function generateStaticParams() {
  return locales.flatMap((locale) => SEED_CONTACT_IDS.map((id) => ({ locale, id })))
}

export async function generateMetadata({ params }: PageProps<"/[locale]/app/contacts/[id]">): Promise<Metadata> {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.contact
  return { ...pageMetadata(locale, `/app/contacts/${id}`, m.title, m.description), robots: { index: false, follow: true } }
}

export default async function ContactPage({ params }: PageProps<"/[locale]/app/contacts/[id]">) {
  const { id } = await params
  return <ContactView id={id} />
}
