import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getCanonicalSiteUrl } from '@/utilities/getCanonicalSiteUrl'

const getPagesSitemap = unstable_cache(
  async (siteUrl: string) => {
    const payload = await getPayload({ config })

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: { equals: 'published' },
      },
      select: {
        slug: true,
        updatedAt: true,
        breadcrumbs: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const defaultSitemap = [
      { loc: `${siteUrl}/search`, lastmod: dateFallback },
      { loc: `${siteUrl}/posts`, lastmod: dateFallback },
    ]

    const sitemap = (results.docs ?? [])
      .filter((page) => Boolean(page?.slug))
      .map((page) => {
        const bcUrl = page.breadcrumbs?.[page.breadcrumbs.length - 1]?.url
        const path =
          bcUrl && bcUrl.length > 0
            ? bcUrl
            : page.slug === 'home'
              ? '/'
              : `/${page.slug}`
        return {
          loc: path === '/' ? `${siteUrl}/` : `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`,
          lastmod: page.updatedAt || dateFallback,
        }
      })

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  { tags: ['pages-sitemap', 'global_site-settings'] },
)

export async function GET() {
  const siteUrl = await getCanonicalSiteUrl()
  const sitemap = await getPagesSitemap(siteUrl)
  return getServerSideSitemap(sitemap)
}
