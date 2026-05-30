import { unstable_cache } from 'next/cache'
import { getCanonicalSiteUrl } from '@/utilities/getCanonicalSiteUrl'

const getSitemapIndex = unstable_cache(
  async () => {
    const siteUrl = await getCanonicalSiteUrl()
    const now = new Date().toISOString()
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/pages-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/posts-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>
`
  },
  ['sitemap-index'],
  { tags: ['global_site-settings', 'pages-sitemap', 'posts-sitemap'] },
)

export async function GET() {
  const body = await getSitemapIndex()
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
