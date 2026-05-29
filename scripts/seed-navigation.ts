/**
 * Seed Payload navigation globals from navigation.yml (multi-locale aware).
 *
 *   pnpm exec tsx scripts/seed-navigation.ts
 *
 * Reads ./navigation.yml at project root, looks up Pages by `ref` (= page
 * slug in default locale), and writes header-navigation, main-navigation,
 * footer-navigation globals. Per-locale labels supported via `labels` map.
 *
 * ## navigation.yml schema
 *
 * ```yaml
 * defaultLocale: tr
 * locales: [tr, en]                # optional; default = [defaultLocale]
 *
 * header:                          # navItems for 'header-navigation' global
 *   - label: "Online Satış"
 *     labels: { tr: "Online Satış", en: "Online Sales" }   # optional
 *     url: "https://online.example.com"
 *     type: external
 *   - label: "İndirme Merkezi"
 *     ref: "indirme-merkezi"      # = Page slug in default locale
 *     type: internal
 *   - label: "Sanal Deneyim"
 *     type: group                  # pageless header (sayfasız başlık)
 *     children:
 *       - label: "Sanal Odalar"
 *         ref: "sanal-odalar"
 *         type: internal
 *
 * main: [...]                      # navItems for 'main-navigation' (3 levels)
 * footer: [...]                    # navItems for 'footer-navigation' (2 levels)
 * ```
 *
 * Type → Payload link mapping:
 *   external → link.type='custom', url, newTab=true
 *   internal → link.type='reference', reference={relationTo:'pages', value:id}
 *   group    → link.type='group' (no ref/url; only label)
 */

import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import yaml from 'js-yaml'
import { getPayload } from 'payload'
import config from '../src/payload.config'

type NavType = 'external' | 'internal' | 'group'
type NavItem = {
  label: string
  labels?: Record<string, string>
  type: NavType
  url?: string
  ref?: string
  children?: NavItem[]
}
type NavDoc = {
  defaultLocale?: string
  locales?: string[]
  header?: NavItem[]
  main?: NavItem[]
  footer?: NavItem[]
}

const NAV_PATH = path.resolve(process.cwd(), 'navigation.yml')

const raw = await fs.readFile(NAV_PATH, 'utf8').catch(() => {
  console.error(`✗ navigation.yml not found at ${NAV_PATH}`)
  process.exit(1)
})
const doc = yaml.load(raw) as NavDoc

const defaultLocale = doc.defaultLocale || 'tr'
const allLocales = doc.locales?.length ? doc.locales : [defaultLocale]

const payload = await getPayload({ config })

const pageIdCache: Record<string, number | string> = {}
async function findPageId(slug: string): Promise<number | string | null> {
  if (pageIdCache[slug] !== undefined) return pageIdCache[slug]
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale: defaultLocale,
  })
  if (res.docs[0]) {
    pageIdCache[slug] = res.docs[0].id
    return res.docs[0].id
  }
  return null
}

function labelFor(item: NavItem, locale: string): string {
  return item.labels?.[locale] ?? item.label
}

async function buildLink(item: NavItem, locale: string) {
  const label = labelFor(item, locale)
  if (item.type === 'external') {
    return { type: 'custom' as const, newTab: true, url: item.url ?? '#', label }
  }
  if (item.type === 'group') {
    return { type: 'group' as const, newTab: false, label }
  }
  const pageId = item.ref ? await findPageId(item.ref) : null
  if (!pageId) {
    console.warn(`  ⚠ [${locale}] ref="${item.ref}" Page'te bulunamadı — custom URL fallback`)
    return { type: 'custom' as const, newTab: false, url: '#', label }
  }
  return {
    type: 'reference' as const,
    newTab: false,
    reference: { relationTo: 'pages' as const, value: pageId },
    label,
  }
}

// HeaderNavigation + FooterNavigation: 2 levels (navItems → subItems)
async function buildTwoLevel(items: NavItem[], locale: string) {
  return Promise.all(
    items.map(async (item) => {
      const link = await buildLink(item, locale)
      const subItems = item.children
        ? await Promise.all(
            item.children.map(async (c) => ({ link: await buildLink(c, locale) })),
          )
        : []
      return { link, ...(subItems.length ? { subItems } : {}) }
    }),
  )
}

// MainNavigation: 3 levels (navItems → subItems → children)
async function buildThreeLevel(items: NavItem[], locale: string) {
  return Promise.all(
    items.map(async (item) => {
      const link = await buildLink(item, locale)
      const subItems = item.children
        ? await Promise.all(
            item.children.map(async (c) => {
              const subLink = await buildLink(c, locale)
              const children = c.children
                ? await Promise.all(
                    c.children.map(async (cc) => ({ link: await buildLink(cc, locale) })),
                  )
                : []
              return { link: subLink, ...(children.length ? { children } : {}) }
            }),
          )
        : []
      return { link, ...(subItems.length ? { subItems } : {}) }
    }),
  )
}

const targets = [
  { yml: 'header', slug: 'header-navigation', builder: buildTwoLevel },
  { yml: 'main', slug: 'main-navigation', builder: buildThreeLevel },
  { yml: 'footer', slug: 'footer-navigation', builder: buildTwoLevel },
] as const

for (const locale of allLocales) {
  console.log(`\n→ Locale: ${locale}`)
  for (const t of targets) {
    const items = doc[t.yml]
    if (!items?.length) {
      console.log(`  ↻ ${t.slug}: ${t.yml} navigation.yml'de tanımlı değil, atlanıyor`)
      continue
    }
    const navItems = await t.builder(items, locale)
    await payload.updateGlobal({
      slug: t.slug,
      data: { navItems } as any,
      locale,
      context: { disableRevalidate: true },
    })
    console.log(`  ✓ ${t.slug}: ${navItems.length} item`)
  }
}

console.log('\n✓ Navigation seed tamamlandı')
process.exit(0)
