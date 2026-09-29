import type { Metadata } from "next"
import { Suspense } from "react"

import { CheckView } from "@/components/demo/check-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/check">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.check
  return pageMetadata(locale, "/app/check", m.title, m.description)
}

export default function CheckPage() {
  // Reads ?address= from the quick check, so it renders under Suspense.
  return (
    <Suspense>
      <CheckView />
    </Suspense>
  )
}
