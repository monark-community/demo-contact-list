import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { ADDR, INES_LOOKALIKE } from "@/lib/demo/addresses"
import { shortAddress } from "@/lib/format"

export const alt = "TrustList by Monark"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const mark = await readFile(join(process.cwd(), "public/brand/monark-mark.svg"), "utf8")
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`
  const lv = d.app.trust.levels
  const rows = [
    { addr: ADDR.ines, name: d.seed.people.ines.name, chip: lv.trusted, bad: false },
    { addr: INES_LOOKALIKE, name: d.home.card.lookalike.replace("{name}", d.seed.people.ines.name), chip: d.home.card.dontCopy, bad: true },
    { addr: ADDR.northbridge, name: d.seed.people.northbridge.name, chip: lv.trusted, bad: false },
    { addr: ADDR.malik, name: d.seed.people.malik.name, chip: lv.known, bad: false },
  ]

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFF9F3", color: "#15110E", padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markSrc} width={64} height={64} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>TrustList</span>
              <span style={{ fontSize: 22, color: "#625952", marginTop: 6 }}>{d.common.byMonark}</span>
            </div>
          </div>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.06, letterSpacing: -1.5 }}>{d.meta.ogTagline}</div>
          <div style={{ fontSize: 22, color: "#625952" }}>{d.common.demoBadge}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, marginLeft: 40, width: 472 }}>
          {rows.map((r) => (
            <div
              key={r.addr}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 20px",
                borderRadius: 22,
                background: "#FFFEFC",
                border: r.bad ? "3px solid #c81e0b" : "2px solid #E9DFD7",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: r.bad ? "#c81e0b" : "#15110E" }}>{r.name}</span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: r.bad ? "#c81e0b" : "#F7ECE4",
                    color: r.bad ? "#FFFFFF" : "#15110E",
                  }}
                >
                  {r.chip}
                </span>
              </div>
              <span style={{ fontSize: 20, color: "#625952", marginTop: 4, fontFamily: "monospace" }}>{shortAddress(r.addr, 10, 8)}</span>
            </div>
          ))}
          <div style={{ display: "flex", height: 4, background: "#F88D10", borderRadius: 4, marginTop: 6 }} />
        </div>
      </div>
    ),
    size
  )
}
