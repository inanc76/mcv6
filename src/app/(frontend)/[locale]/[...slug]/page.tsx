import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

type Locale = 'tr' | 'en'
const LOCALES: readonly Locale[] = ['tr', 'en']

function resolveLocale(value: string | undefined): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : 'tr'
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const params: Array<{ locale: Locale; slug: string[] }> = []

  for (const locale of LOCALES) {
    const pages = await payload.find({
      collection: 'pages',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      locale,
      select: { slug: true },
    })
    pages.docs
      ?.filter((doc) => doc.slug !== 'home')
      .forEach(({ slug }) => params.push({ locale, slug: [slug as string] }))
  }

  return params
}

type Args = {
  params: Promise<{
    locale?: string
    slug?: string[]
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale: rawLocale, slug: segments = ['home'] } = await paramsPromise
  const locale = resolveLocale(rawLocale)
  const decoded = segments.map((s) => decodeURIComponent(s))
  const url = '/' + decoded.join('/')

  let page: RequiredDataFromCollectionSlug<'pages'> | null = await queryPageByPath({
    path: url,
    locale,
  })

  if (!page && decoded.length === 1 && decoded[0] === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale: rawLocale, slug: segments = ['home'] } = await paramsPromise
  const locale = resolveLocale(rawLocale)
  const decoded = segments.map((s) => decodeURIComponent(s))
  const url = '/' + decoded.join('/')
  const page = await queryPageByPath({ path: url, locale })

  return generateMeta({ doc: page })
}

const queryPageByPath = cache(async ({ path, locale }: { path: string; locale: Locale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  // nested-docs writes a `breadcrumbs` array per page. Match candidates where any breadcrumb url equals the requested path,
  // then narrow to the doc whose *last* breadcrumb (its own full URL) matches — avoids parent-segment false positives.
  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 5,
    pagination: false,
    overrideAccess: draft,
    locale,
    where: {
      'breadcrumbs.url': { equals: path },
    },
  })

  const match = result.docs?.find((doc) => {
    const crumbs = (doc as unknown as { breadcrumbs?: Array<{ url?: string | null }> })
      .breadcrumbs
    const last = crumbs?.[crumbs.length - 1]
    return last?.url === path
  })

  if (match) return match

  if (path === '/home') {
    const homeResult = await payload.find({
      collection: 'pages',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      locale,
      where: { slug: { equals: 'home' } },
    })
    return homeResult.docs?.[0] || null
  }

  return null
})
