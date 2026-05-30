import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

export type SiteMode = 'live' | 'development'

export const getSiteMode = unstable_cache(
  async (): Promise<SiteMode> => {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'seo-settings', depth: 0 })
    return settings?.siteMode === 'development' ? 'development' : 'live'
  },
  ['site-mode'],
  { tags: ['global_seo-settings'] },
)
