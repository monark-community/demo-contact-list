import type { Metadata } from "next"
import { Suspense } from "react"

import { ContactForm } from "@/components/demo/contact-form"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/new">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.newContact
  return pageMetadata(locale, "/app/new", m.title, m.description)
}

export default function NewContactPage() {
  // The form reads ?address= and ?name= (from the address check), so it renders under Suspense.
  return (
    <Suspense>
      <ContactForm />
    </Suspense>
  )
}
