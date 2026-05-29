import type { Metadata } from 'next'

import PageTemplate, { generateMetadata as templateGenerateMetadata } from './[...slug]/page'

type HomeArgs = {
  params: Promise<{
    locale?: string
  }>
}

// The home page reuses the [...slug] template with segments=['home'] so logic stays in one place.
function adaptParams(localeParams: Promise<{ locale?: string }>) {
  return localeParams.then(({ locale }) => ({ locale, slug: ['home'] }))
}

export default async function HomePage({ params }: HomeArgs) {
  return PageTemplate({ params: adaptParams(params) })
}

export async function generateMetadata({ params }: HomeArgs): Promise<Metadata> {
  return templateGenerateMetadata({ params: adaptParams(params) })
}
