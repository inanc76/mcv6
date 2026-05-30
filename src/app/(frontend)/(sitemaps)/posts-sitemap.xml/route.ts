import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getCanonicalSiteUrl } from '@/utilities/getCanonicalSiteUrl'

const getPostsSitemap = unstable_cache(
  async (siteUrl: string) => {
    const payload = await getPayload({ config })

    const results = await payload.find({
      collection: 'posts',
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
      },
    })

    const dateFallback = new Date().toISOString()

    return (results.docs ?? [])
      .filter((post) => Boolean(post?.slug))
      .map((post) => ({
        loc: `${siteUrl}/posts/${post?.slug}`,
        lastmod: post.updatedAt || dateFallback,
      }))
  },
  ['posts-sitemap'],
  { tags: ['posts-sitemap', 'global_site-settings'] },
)

export async function GET() {
  const siteUrl = await getCanonicalSiteUrl()
  const sitemap = await getPostsSitemap(siteUrl)
  return getServerSideSitemap(sitemap)
}
