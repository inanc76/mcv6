import type { Endpoint, PayloadRequest } from 'payload'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

/**
 * Seed Payload Pages from sitemap.yml (skeleton — title + slug + draft, no content).
 *
 * Reads ../sitemap.yml relative to this file's project root, walks the pages tree,
 * and creates one Payload Page per non-group, non-external node. Idempotent: matches
 * by slug, updates if exists, creates if not.
 *
 *   curl -X POST http://127.0.0.1:3000/api/seed-from-sitemap
 *
 * Created by payload-sitemap-parse skill.
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
  children?: SitemapNode[]
}

type SitemapDoc = {
  site: { name: string; defaultLocale: string }
  pages: SitemapNode[]
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
// src/endpoints/seed-from-sitemap/ → up 3 to project root
const projectRoot = path.resolve(dirname, '../../..')
const SITEMAP_PATH = path.join(projectRoot, 'sitemap.yml')

export const seedFromSitemapEndpoint: Endpoint = {
  path: '/seed-from-sitemap',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    const { payload } = req

    let raw: string
    try {
      raw = await fs.readFile(SITEMAP_PATH, 'utf8')
    } catch (err: unknown) {
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

    const stats = {
      pages: { created: 0, updated: 0 },
      folders: { created: 0, updated: 0 },
      skipped_external: 0,
      errors: [] as Array<{ phase: string; slug: string; error: string }>,
    }

    payload.logger.info('▶ seed-from-sitemap started')

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

    // Recursively seeds a node and its children. Top-level YAML entries are
    // passed parentId=null (the YAML flattens root and its peers as siblings —
    // see payload-sitemap-parse skill); their children get this node's id.
    async function seedNode(
      node: SitemapNode,
      parentId: number | string | null,
    ): Promise<void> {
      // [grup] (type='group') nodes do NOT create a Page — they are category/menu
      // headers only (convention: sitemap [grup] => Category only,
      // never a Page). Children still walk through with parentId from the *nearest
      // page ancestor*, not the group, so URL hierarchy may flatten — that's
      // intentional under the new convention. [external] is skipped entirely.
      if (node.type === 'external') {
        stats.skipped_external++
      } else if (node.type === 'group') {
        // skip Page creation; children seed under the *same* parentId (group is transparent)
        if (node.children?.length) {
          for (const child of node.children) {
            await seedNode(child, parentId)
          }
        }
        return
      } else {
        let myId: number | string | null = null
        try {
          const existing = await payload.find({
            collection: 'pages',
            where: { slug: { equals: node.slug } },
            limit: 1,
            depth: 0,
          })

          const data = {
            title: node.title,
            slug: node.slug,
            _status: 'published' as const,
            hero: { type: 'lowImpact' as const },
            layout: [placeholderBlock(node.slug)],
            ...(parentId !== null ? { parent: parentId } : {}),
          }

          if (existing.docs.length > 0) {
            const updated = await payload.update({
              collection: 'pages',
              id: existing.docs[0].id,
              data,
            })
            myId = updated.id
            stats.pages.updated++
            payload.logger.info(`   ↳ updated page ${node.slug} (${node.title})`)
          } else {
            const created = await payload.create({
              collection: 'pages',
              data,
            })
            myId = created.id
            stats.pages.created++
            payload.logger.info(`   ↳ created page ${node.slug} (${node.title})`)
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

    // PHASE 1: Pages with parent relationship
    payload.logger.info('▶ phase 1: seeding pages')
    for (const page of doc.pages) {
      await seedNode(page, null)
    }

    // PHASE 2: Folders for each [grup] + assign pages to nearest group folder.
    // Pages.folders=true makes Payload auto-provision the `payload-folders`
    // collection and a `folder` relation on Pages. Groups become folders;
    // every non-external page is attached to its nearest [grup] ancestor's
    // folder (top-level standalone pages get their own folder too — keeps
    // the admin "Browse by folder" view tidy).
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
        payload.logger.error({ err }, `seed-from-sitemap: folder ${name} failed`)
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
        })
        if (page.docs[0]) {
          await payload.update({
            collection: 'pages',
            id: page.docs[0].id,
            data: { folder: folderId } as any,
          })
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        stats.errors.push({ phase: 'folder-assign', slug, error: message })
        payload.logger.error({ err }, `seed-from-sitemap: assign ${slug} to folder failed`)
      }
    }

    // currentFolderId tracks the nearest containing folder while walking.
    // Folders are created in two cases:
    //   1. Any [grup] node (at any depth) — group becomes a folder with children inside
    //   2. Top-level standalone pages (except landing) — first-level entries always
    //      get their own folder, even if they have no children. This keeps the admin
    //      "Browse by folder" view consistent at the top level.
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
        // Only real Pages (not [grup] entries — they were skipped in Phase 1) get attached.
        await assignPageToFolder(node.slug, folderForThisNode)
      }

      for (const child of node.children || []) {
        await walkForFolders(child, folderForThisNode, false)
      }
    }

    for (const page of doc.pages) {
      await walkForFolders(page, null, true)
    }

    // NOTE: Categories collection is reserved for Posts (blog) taxonomy and is
    // NOT auto-populated from sitemap [grup] nodes. Page hierarchy is already
    // covered by parent/breadcrumbs (nestedDocsPlugin) and admin organization
    // by `folders: true`. Producing Categories from sitemap created an unused
    // third copy of the same information — removed deliberately.

    payload.logger.info(
      `✔ seed-from-sitemap done — pages=${stats.pages.created}+${stats.pages.updated} folders=${stats.folders.created}+${stats.folders.updated} errors=${stats.errors.length}`,
    )

    return Response.json({ ok: stats.errors.length === 0, stats })
  },
}
