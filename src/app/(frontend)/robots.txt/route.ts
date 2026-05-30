import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getServerSideURL } from '@/utilities/getURL'

const buildDefault = (siteUrl: string) =>
  [
    'User-agent: *',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /*.doc$',
    'Disallow: /*.docx$',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join('\n')

const getRobotsTxt = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const siteUrl = getServerSideURL().replace(/\/$/, '')

    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    })

    const custom = settings?.robots?.robotsTxt?.trim()
    return custom && custom.length > 0 ? custom : buildDefault(siteUrl)
  },
  ['site-settings-robots-txt'],
  { tags: ['global_site-settings'] },
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
