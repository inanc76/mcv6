import type { Endpoint, PayloadRequest } from 'payload'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

/**
 * Seed Payload Pages from sitemap.yml (multi-locale aware).
 *
 * Reads ../sitemap.yml relative to this file's project root, walks the pages
 * tree, and creates one Payload Page per non-group, non-external node. Each
 * page is seeded in the configured default locale first; if `slugs` / `titles`
 * locale maps are present on the node, additional locales are filled too.
 * Idempotent: matches by default-locale slug, updates if exists.
 *
 *   curl -X POST http://127.0.0.1:3000/api/seed-from-sitemap
 *
 * ## sitemap.yml schema (backward compatible)
 *
 * ```yaml
 * site:
 *   name: "Site"
 *   defaultLocale: "tr"
 *   locales: ["tr", "en"]   # optional; default = [defaultLocale]
 *
 * pages:
 *   - slug: ege-seramik     # default-locale slug (required)
 *     title: "Ege Seramik"  # default-locale title (required)
 *     slugs:                # optional: per-locale slug overrides
 *       tr: ege-seramik
 *       en: ege-ceramic
 *     titles:               # optional: per-locale title overrides
 *       tr: "Ege Seramik"
 *       en: "Ege Ceramic"
 *     path: /hakkimizda/ege-seramik
 *     type: content
 * ```
 *
 * Old single-locale sitemaps (without `locales`/`slugs`/`titles`) keep working.
 */

type NodeType = 'landing' | 'content' | 'group' | 'form' | 'archive' | 'external'

type SitemapNode = {
  slug: string
  title: string
  path: string
  figma?: string
  type: NodeType
  external?: string
  collection?: string
  slugs?: Record<string, string>
  titles?: Record<string, string>
  children?: SitemapNode[]
}

type SitemapDoc = {
  site: { name: string; defaultLocale: string; locales?: string[] }
  pages: SitemapNode[]
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const projectRoot = path.resolve(dirname, '../../..')
const SITEMAP_PATH = path.join(projectRoot, 'sitemap.yml')

function titleCaseFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export const seedFromSitemapEndpoint: Endpoint = {
  path: '/seed-from-sitemap',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    const { payload } = req

    let raw: string
    try {
      raw = await fs.readFile(SITEMAP_PATH, 'utf8')
    } catch {
      return Response.json(
        { ok: false, error: `sitemap.yml not found at ${SITEMAP_PATH}` },
        { status: 400 },
      )
    }

    let doc: SitemapDoc
    try {
      doc = yaml.load(raw) as SitemapDoc
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: `YAML parse failed: ${message}` }, { status: 400 })
    }

    if (!doc?.pages?.length) {
      return Response.json({ ok: false, error: 'sitemap.yml has no pages' }, { status: 400 })
    }

    const defaultLocale = doc.site?.defaultLocale || 'tr'
    const allLocales = doc.site?.locales?.length ? doc.site.locales : [defaultLocale]
    const extraLocales = allLocales.filter((l) => l !== defaultLocale)

    const stats = {
      pages: { created: 0, updated: 0 },
      folders: { created: 0, updated: 0 },
      locales: { applied: 0, skipped: 0 },
      skipped_external: 0,
      errors: [] as Array<{ phase: string; slug: string; error: string }>,
    }

    payload.logger.info(
      `▶ seed-from-sitemap started (defaultLocale=${defaultLocale}, extraLocales=[${extraLocales.join(',')}])`,
    )

    function placeholderBlock(slug: string) {
      return {
        blockType: 'content' as const,
        columns: [
          {
            size: 'full' as const,
            richText: {
              root: {
                type: 'root',
                format: '' as const,
                indent: 0,
                version: 1,
                direction: 'ltr' as const,
                children: [
                  {
                    type: 'paragraph',
                    format: '' as const,
                    indent: 0,
                    version: 1,
                    direction: 'ltr' as const,
                    textFormat: 0,
                    children: [
                      {
                        type: 'text',
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: `(skeleton — fill via /payload-design-to-blocks page=${slug})`,
                        version: 1,
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      }
    }

    function slugFor(node: SitemapNode, locale: string): string {
      return node.slugs?.[locale] ?? node.slug
    }
    function titleFor(node: SitemapNode, locale: string): string {
      if (node.titles?.[locale]) return node.titles[locale]
      if (locale !== defaultLocale && node.slugs?.[locale]) {
        return titleCaseFromSlug(node.slugs[locale])
      }
      return node.title
    }

    async function seedNode(
      node: SitemapNode,
      parentId: number | string | null,
    ): Promise<void> {
      if (node.type === 'external') {
        stats.skipped_external++
      } else if (node.type === 'group') {
        if (node.children?.length) {
          for (const child of node.children) {
            await seedNode(child, parentId)
          }
        }
        return
      } else {
        let myId: number | string | null = null
        try {
          const defaultSlug = slugFor(node, defaultLocale)
          const existing = await payload.find({
            collection: 'pages',
            where: { slug: { equals: defaultSlug } },
            limit: 1,
            depth: 0,
            locale: defaultLocale,
          })

          const data = {
            title: titleFor(node, defaultLocale),
            slug: defaultSlug,
            _status: 'published' as const,
            hero: { type: 'lowImpact' as const },
            layout: [placeholderBlock(defaultSlug)],
            ...(parentId !== null ? { parent: parentId } : {}),
          }

          if (existing.docs.length > 0) {
            const updated = await payload.update({
              collection: 'pages',
              id: existing.docs[0].id,
              data,
              locale: defaultLocale,
              context: { disableRevalidate: true },
            })
            myId = updated.id
            stats.pages.updated++
            payload.logger.info(`   ↳ updated page ${defaultSlug} [${defaultLocale}]`)
          } else {
            const created = await payload.create({
              collection: 'pages',
              data,
              locale: defaultLocale,
              context: { disableRevalidate: true },
            })
            myId = created.id
            stats.pages.created++
            payload.logger.info(`   ↳ created page ${defaultSlug} [${defaultLocale}]`)
          }

          if (myId !== null) {
            for (const locale of extraLocales) {
              const hasLocaleData =
                node.slugs?.[locale] !== undefined || node.titles?.[locale] !== undefined
              if (!hasLocaleData) {
                stats.locales.skipped++
                continue
              }
              try {
                await payload.update({
                  collection: 'pages',
                  id: myId,
                  data: {
                    title: titleFor(node, locale),
                    slug: slugFor(node, locale),
                  },
                  locale,
                  context: { disableRevalidate: true },
                })
                stats.locales.applied++
                payload.logger.info(
                  `      ↳ [${locale}] slug=${slugFor(node, locale)} title="${titleFor(node, locale)}"`,
                )
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err)
                stats.errors.push({
                  phase: `pages-locale-${locale}`,
                  slug: defaultSlug,
                  error: message,
                })
              }
            }
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err)
          stats.errors.push({ phase: 'pages', slug: node.slug, error: message })
          payload.logger.error({ err }, `seed-from-sitemap: page ${node.slug} failed`)
        }

        if (node.children?.length) {
          for (const child of node.children) {
            await seedNode(child, myId)
          }
        }
      }
    }

    payload.logger.info('▶ phase 1: seeding pages (default + extra locales)')
    for (const page of doc.pages) {
      await seedNode(page, null)
    }

    payload.logger.info('▶ phase 2: seeding folders')

    async function findOrCreateFolder(
      name: string,
      parentFolderId: number | string | null,
    ): Promise<number | string | null> {
      try {
        const where: any = parentFolderId
          ? { and: [{ name: { equals: name } }, { folder: { equals: parentFolderId } }] }
          : { and: [{ name: { equals: name } }, { folder: { exists: false } }] }

        const existing = await payload.find({
          collection: 'payload-folders',
          where,
          limit: 1,
          depth: 0,
        })

        const data: any = {
          name,
          folderType: ['pages'],
          ...(parentFolderId ? { folder: parentFolderId } : {}),
        }

        if (existing.docs.length > 0) {
          const updated = await payload.update({
            collection: 'payload-folders',
            id: existing.docs[0].id,
            data,
          })
          stats.folders.updated++
          payload.logger.info(`   ↳ updated folder "${name}"`)
          return updated.id
        } else {
          const created = await payload.create({
            collection: 'payload-folders',
            data,
          })
          stats.folders.created++
          payload.logger.info(`   ↳ created folder "${name}"`)
          return created.id
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        stats.errors.push({ phase: 'folders', slug: name, error: message })
        return null
      }
    }

    async function assignPageToFolder(
      slug: string,
      folderId: number | string | null,
    ): Promise<void> {
      if (!folderId) return
      try {
        const page = await payload.find({
          collection: 'pages',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 0,
          locale: defaultLocale,
        })
        if (page.docs[0]) {
          await payload.update({
            collection: 'pages',
            id: page.docs[0].id,
            data: { folder: folderId } as any,
            context: { disableRevalidate: true },
          })
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        stats.errors.push({ phase: 'folder-assign', slug, error: message })
      }
    }

    async function walkForFolders(
      node: SitemapNode,
      currentFolderId: number | string | null,
      isTopLevel: boolean,
    ): Promise<void> {
      let folderForThisNode = currentFolderId

      const shouldCreateFolder =
        node.type === 'group' ||
        (isTopLevel && node.type !== 'landing' && node.type !== 'external')

      if (shouldCreateFolder) {
        const folderId = await findOrCreateFolder(node.title, currentFolderId)
        folderForThisNode = folderId
      }

      if (node.type !== 'external' && node.type !== 'group') {
        const defaultSlug = slugFor(node, defaultLocale)
        await assignPageToFolder(defaultSlug, folderForThisNode)
      }

      for (const child of node.children || []) {
        await walkForFolders(child, folderForThisNode, false)
      }
    }

    for (const page of doc.pages) {
      await walkForFolders(page, null, true)
    }

    payload.logger.info(
      `✔ seed-from-sitemap done — pages=${stats.pages.created}+${stats.pages.updated} folders=${stats.folders.created}+${stats.folders.updated} locales(extra)=${stats.locales.applied}/${stats.locales.applied + stats.locales.skipped} errors=${stats.errors.length}`,
    )

    return Response.json({ ok: stats.errors.length === 0, stats })
  },
}
