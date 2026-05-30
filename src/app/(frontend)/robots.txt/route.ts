import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getCanonicalSiteUrl } from '@/utilities/getCanonicalSiteUrl'

const DEV_ROBOTS = 'User-agent: *\nDisallow: /\n'

const stripSitemapLines = (txt: string) =>
  txt
    .split('\n')
    .filter((line) => !/^\s*sitemap\s*:/i.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

const buildLiveDefault = () =>
  ['User-agent: *', 'Disallow: /admin/', 'Disallow: /api/', 'Disallow: /*.doc$', 'Disallow: /*.docx$', 'Allow: /'].join(
    '\n',
  )

const getRobotsTxt = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const seo = await payload.findGlobal({ slug: 'seo-settings', depth: 0 })

    if (seo?.siteMode === 'development') return DEV_ROBOTS

    const custom = seo?.robotsTxt?.trim()
    const base = custom && custom.length > 0 ? stripSitemapLines(custom) : buildLiveDefault()
    const siteUrl = await getCanonicalSiteUrl()
    return `${base}\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  },
  ['site-settings-robots-txt'],
  { tags: ['global_seo-settings', 'global_site-settings'] },
)

export async function GET() {
  const body = await getRobotsTxt()
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
