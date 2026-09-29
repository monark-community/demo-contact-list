import type { Metadata } from "next"

import { AppsView } from "@/components/demo/apps-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/apps">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.apps
  return pageMetadata(locale, "/app/apps", m.title, m.description)
}

export default function AppsPage() {
  return <AppsView />
}
