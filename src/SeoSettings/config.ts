import type { FieldHook, GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { revalidateSeoSettings } from './hooks/revalidateSeoSettings'

// Sitemap satırlarını DB'ye yazmadan strip et — route handler canonical URL'le append ediyor.
const stripSitemapLines: FieldHook = ({ value }) => {
  if (typeof value !== 'string') return value
  return value
    .split('\n')
    .filter((line) => !/^\s*sitemap\s*:/i.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export const SeoSettings: GlobalConfig = {
  slug: 'seo-settings',
  label: { tr: 'SEO Ayarları', en: 'SEO Settings' },
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    group: { en: 'Globals', tr: 'Globaller' },
    description: {
      en: 'Search engine + indexing controls. Site mode toggle is also on the dashboard.',
      tr: 'Arama motoru + indeksleme ayarları. Site modu anahtarı dashboard üst kısmında da var.',
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─── ROBOTS TAB ───────────────────────────────────────────────────
        // Unnamed tab → siteMode + robotsTxt top-level'da kalır, DB değişmez.
        // useFormFields paths korunur ('siteMode'), POST body shape korunur.
        // İleride yeni tab'lar eklenecek (Default Meta, OG Defaults, Structured Data, vs.).
        {
          label: { en: 'Robots', tr: 'Robots' },
          description: {
            en: 'Search engine indexing rules + robots.txt content.',
            tr: 'Arama motoru indeksleme kuralları + robots.txt içeriği.',
          },
          fields: [
            {
              name: 'siteMode',
              label: { en: 'Site Mode', tr: 'Site Modu' },
              type: 'radio',
              options: [
                { label: { en: 'Live', tr: 'YAYIN' }, value: 'live' },
                { label: { en: 'Development', tr: 'GELİŞTİRME' }, value: 'development' },
              ],
              // Fresh projects start in development so half-built sites are never accidentally indexed.
              defaultValue: 'development',
              required: true,
              admin: {
                layout: 'horizontal',
                description: {
                  en: 'Development: search engines blocked, robots.txt returns Disallow: /, pages emit noindex meta. Live: your robots.txt content below is served.',
                  tr: 'GELİŞTİRME: arama motorları engellenir, robots.txt "Disallow: /" döner, sayfalara noindex meta eklenir. YAYIN: aşağıdaki robots.txt içeriği servis edilir.',
                },
                components: {
                  Field: '@/SeoSettings/components/SiteModeRadioField',
                },
              },
            },
            {
              name: 'robotsTxt',
              label: { en: 'robots.txt content (Live mode)', tr: 'robots.txt içeriği (YAYIN modu)' },
              type: 'textarea',
              hooks: {
                beforeChange: [stripSitemapLines],
              },
              admin: {
                components: {
                  Field: '@/SeoSettings/components/RobotsTxtField',
                },
              },
              defaultValue: [
                'User-agent: *',
                'Disallow: /admin/',
                'Disallow: /api/',
                'Disallow: /*.doc$',
                'Disallow: /*.docx$',
                'Allow: /',
              ].join('\n'),
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSeoSettings],
  },
}
