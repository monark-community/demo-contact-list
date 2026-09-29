// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start -p 3136   (in another terminal)
//        pnpm screenshots                   (BASE_URL defaults to http://localhost:3136)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
// ONLY=<substring> limits the run to matching variants (e.g. ONLY=en-390-light).
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3136"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY
const KEY = "trustlist-demo-v1"
// Same first and last four characters as Inès Roy's main wallet.
const LOOKALIKE = `0x7a3f${"0".repeat(32)}c19e`

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const L = {
  en: {
    connect: "Connect demo wallet",
    confirm: "Confirm",
    reject: "Reject",
    contacts: "Your contacts",
    lookalikeSample: "A lookalike of Inès",
    dontSend: "Don't send",
    openMenu: "Open menu",
  },
  fr: {
    connect: "Connecter le portefeuille de démo",
    confirm: "Confirmer",
    reject: "Refuser",
    contacts: "Vos contacts",
    lookalikeSample: "Une imitation d'Inès",
    dontSend: "N'envoyez pas",
    openMenu: "Ouvrir le menu",
  },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    // Final states only: the hero loop and entrance animations render settled.
    reducedMotion: "reduce",
    hasTouch: w < 768,
    isMobile: w < 768,
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! pageerror", e.message))
  return { context, page }
}

async function eagerImages(page) {
  await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll("img")]
    for (const i of imgs) i.loading = "eager"
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => i.addEventListener("load", r, { once: true }) || setTimeout(r, 3000)))))
  })
}

const shot = async (page, v, name, fullPage = false) => {
  const file = `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`
  if (fullPage) {
    await eagerImages(page)
    await page.evaluate(() => window.scrollTo(0, 0))
  }
  await page.waitForTimeout(250)
  await page.screenshot({ path: file, fullPage })
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

async function openControls(page) {
  await page.getByRole("button", { name: /Demo controls|Contrôles de la démo/ }).first().click()
  await page.getByRole("dialog").waitFor()
}

async function toggleFailNext(page) {
  await openControls(page)
  await page.getByRole("dialog").getByRole("switch").first().click()
  await page.keyboard.press("Escape")
  await page.getByRole("dialog").waitFor({ state: "detached" })
}

async function confirmPrompt(page, t) {
  const d = page.getByRole("dialog")
  await d.waitFor()
  await d.getByRole("button", { name: t.confirm, exact: true }).click()
  await d.waitFor({ state: "detached" })
}

async function connect(page, v, capture) {
  const t = L[v.locale]
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  const btn = page.getByRole("main").getByRole("button", { name: t.connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "app-01-gate", true)
  await btn.click()
  await page.getByRole("dialog").waitFor()
  if (capture) await shot(page, v, "flow1-connect-prompt")
  await page.getByRole("dialog").getByRole("button", { name: t.confirm, exact: true }).click()
  if (capture) {
    await page.getByRole("status").first().waitFor()
    await shot(page, v, "flow1-decrypting")
  }
  await page.getByRole("heading", { level: 1, name: t.contacts, exact: true }).waitFor({ timeout: 10000 })
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(300)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: L[v.locale].openMenu }).click()
    await page.getByRole("dialog").waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function appFlows(page, v) {
  const t = L[v.locale]
  // Flow 1: unlock (gate, prompt, decrypting captured inside connect())
  await connect(page, v, true)
  await shot(page, v, "app-02-contacts", true)
  await page.getByLabel("Search contacts").fill("Satoshi")
  await shot(page, v, "app-03-empty-search")

  // Flow 1 failure: rejected sign-in
  await page.evaluate((key) => {
    const s = JSON.parse(localStorage.getItem(key))
    s.wallet.status = "disconnected"
    localStorage.setItem(key, JSON.stringify(s))
  }, KEY)
  await page.reload({ waitUntil: "networkidle" })
  await page.getByRole("main").getByRole("button", { name: t.connect }).click()
  await page.getByRole("dialog").getByRole("button", { name: t.reject }).click()
  await page.getByText("You declined the sign-in").waitFor()
  await shot(page, v, "flow1-connect-rejected")
  await page.getByRole("main").getByRole("button", { name: t.connect }).click()
  await confirmPrompt(page, t)
  await page.getByRole("heading", { level: 1, name: t.contacts, exact: true }).waitFor({ timeout: 10000 })

  // Flow 2: address check
  await page.goto(`${BASE}/${v.locale}/app/check`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await page.getByRole("button", { name: t.lookalikeSample }).click()
  await page.getByText("Checking your list").waitFor()
  await shot(page, v, "flow2-check-scanning")
  await page.getByRole("heading", { name: t.dontSend }).waitFor({ timeout: 10000 })
  await shot(page, v, "flow2-check-lookalike", true)
  await page.getByRole("button", { name: "Flag this address" }).click()
  await page.getByText("You flagged").waitFor()
  await shot(page, v, "flow2-check-flagged")
  await page.getByRole("button", { name: "Inès's main wallet" }).click()
  await page.getByRole("heading", { name: "Safe to send" }).waitFor({ timeout: 10000 })
  await shot(page, v, "flow2-check-safe", true)
  await toggleFailNext(page)
  await page.getByRole("button", { name: "Known to your circle" }).click()
  await page.getByText("We couldn't reach your circles").waitFor({ timeout: 10000 })
  await shot(page, v, "flow2-check-circles-down", true)
  await page.getByRole("button", { name: "Check address" }).click()
  await page.getByRole("heading", { name: "Check first" }).waitFor({ timeout: 10000 })
  await shot(page, v, "flow2-check-circle-vouched", true)

  // Flow 3: add a contact (errors, lookalike warning, publish failure, then success)
  await page.goto(`${BASE}/${v.locale}/app/new`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await page.getByRole("button", { name: "Save contact" }).click()
  await page.waitForTimeout(200)
  await shot(page, v, "flow3-form-errors", true)
  await page.getByLabel("Wallet address").fill(LOOKALIKE)
  await page.getByLabel("Wallet address").blur()
  await shot(page, v, "flow3-form-lookalike")
  await page.getByLabel("Wallet address").fill("0x2b9e61f07c4a58d3e0b17a9c6f42d85e1c7a3b90")
  await page.getByLabel("Name", { exact: true }).fill("Léa Gagnon")
  await page.getByLabel("Role or context (optional)").fill("Hackathon mentor, Concordia")
  await page.getByLabel("Where you met (optional)").fill("ETHMontréal hackathon")
  await page.getByRole("button", { name: "Developer", exact: true }).click()
  await page.getByText("Known", { exact: true }).first().click()
  await page.getByLabel("Private note").fill("Mentored team Lumen. Happy to review our escrow contract before the next bounty round.")
  await page.getByText("Public", { exact: true }).click()
  await shot(page, v, "flow3-form-filled", true)
  await toggleFailNext(page)
  await page.getByRole("button", { name: "Save and publish" }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "flow3-publish-prompt")
  await confirmPrompt(page, t)
  await page.getByText("Publishing to IPFS").waitFor()
  await shot(page, v, "flow3-publish-pending")
  await page.getByText("Publishing failed on the network").waitFor({ timeout: 10000 })
  await page.getByText("Publishing failed on the network").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-publish-failed")
  await page.getByRole("button", { name: "Try again" }).click()
  await confirmPrompt(page, t)
  await page.waitForURL(/\/app\/contacts\//, { timeout: 15000 })
  await page.getByRole("heading", { level: 1, name: "Léa Gagnon" }).waitFor()
  await page.waitForTimeout(400)
  await shot(page, v, "flow3-published", true)

  // Flow 4: verify (expired once, then verified) and vouch
  await page.goto(`${BASE}/${v.locale}/app/contacts/malik-haddad`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow4-contact", true)
  await toggleFailNext(page)
  await page.getByRole("button", { name: "Ask Malik to verify" }).click()
  await confirmPrompt(page, t)
  await page.getByText("Waiting for Malik to sign").waitFor()
  await page.getByText("Waiting for Malik to sign").scrollIntoViewIfNeeded()
  await shot(page, v, "flow4-verify-waiting")
  await page.getByText("didn't sign").waitFor({ timeout: 10000 })
  await shot(page, v, "flow4-verify-expired")
  await page.getByRole("button", { name: "Ask Malik to verify" }).click()
  await confirmPrompt(page, t)
  await page.getByText(/Signed on/).waitFor({ timeout: 10000 })
  await page.getByRole("button", { name: "Vouch publicly" }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "flow4-vouch-prompt")
  await confirmPrompt(page, t)
  await page.getByText(/You vouched on/).waitFor({ timeout: 10000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow4-verified-vouched", true)

  // Flow 5: connected apps
  await page.goto(`${BASE}/${v.locale}/app/apps`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow5-apps-request", true)
  await page.getByRole("button", { name: "Allow access" }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "flow5-allow-prompt")
  await confirmPrompt(page, t)
  await page.getByRole("heading", { name: "What TaskFlow shows" }).waitFor({ timeout: 10000 })
  await page.getByText("Revoke").first().waitFor()
  await page.waitForTimeout(1200)
  await shot(page, v, "flow5-granted", true)
  await page.getByRole("button", { name: "Revoke" }).first().click()
  await confirmPrompt(page, t)
  await page.getByText("Access revoked").waitFor({ timeout: 10000 })
  await page.getByText("Access revoked").scrollIntoViewIfNeeded()
  await shot(page, v, "flow5-revoked")

  // Demo controls
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  await openControls(page)
  await shot(page, v, "app-04-demo-controls")
  await page.keyboard.press("Escape")
}

async function frenchFlow(page, v) {
  const t = L.fr
  await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" })
  await page.waitForTimeout(300)
  await shot(page, v, "page-home", true)
  await page.goto(`${BASE}/fr/how-it-works`, { waitUntil: "networkidle" })
  await shot(page, v, "page-how-it-works", true)
  await connect(page, v, false)
  await shot(page, v, "app-02-contacts", true)
  await page.goto(`${BASE}/fr/app/check`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: t.lookalikeSample }).click()
  await page.getByRole("heading", { name: t.dontSend }).waitFor({ timeout: 10000 })
  await shot(page, v, "flow2-check-lookalike", true)
  await page.goto(`${BASE}/fr/app/contacts/malik-haddad`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Demander à Malik de vérifier" }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "flow4-verify-prompt")
  await confirmPrompt(page, t)
  await page.getByText(/Signée le/).waitFor({ timeout: 10000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow4-verified", true)
  await page.goto(`${BASE}/fr/app/new`, { waitUntil: "networkidle" })
  await page.getByLabel("Adresse du portefeuille").fill(LOOKALIKE)
  await page.getByLabel("Adresse du portefeuille").blur()
  await shot(page, v, "flow3-form-lookalike", true)
  await page.goto(`${BASE}/fr/app/apps`, { waitUntil: "networkidle" })
  await shot(page, v, "flow5-apps-request", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
