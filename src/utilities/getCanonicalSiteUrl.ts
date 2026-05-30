import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getServerSideURL } from './getURL'

const normalize = (url: string) => url.replace(/\/$/, '')

/**
 * Canonical site URL — prefers SiteSettings.branding.siteUrl (admin-configured),
 * falls back to NEXT_PUBLIC_SERVER_URL / VERCEL_PROJECT_PRODUCTION_URL.
 *
 * Used by robots.txt, sitemap.xml, OG image base URL, canonical link tags.
 * Cached with revalidateTag('global_site-settings') so admin saves invalidate it.
 */
export const getCanonicalSiteUrl = unstable_cache(
  async (): Promise<string> => {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    const fromAdmin = settings?.branding?.siteUrl?.trim()
    if (fromAdmin && /^https?:\/\//i.test(fromAdmin)) return normalize(fromAdmin)
    return normalize(getServerSideURL())
  },
  ['canonical-site-url'],
  { tags: ['global_site-settings'] },
)
