'use client'

import React from 'react'
import { useField, useFormFields, useTranslation } from '@payloadcms/ui'

type Props = { path: string }

const buildDevContent = () => 'User-agent: *\nDisallow: /'

const RobotsTxtField: React.FC<Props> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  // siteMode artık SAME global'de (seo-settings), top-level. Path: 'siteMode'
  const siteMode = useFormFields(
    ([fields]) => fields?.['siteMode']?.value as string | undefined,
  )
  const isDev = siteMode === 'development'

  const { i18n } = useTranslation()
  const lang: 'tr' | 'en' = i18n?.language === 'en' ? 'en' : 'tr'

  // siteUrl başka global'de (site-settings.branding.siteUrl) — fetch ile çekiyoruz.
  const [fetchedSiteUrl, setFetchedSiteUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    let cancelled = false
    fetch('/api/globals/site-settings?depth=0', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const url = d?.branding?.siteUrl?.trim()
        if (url && /^https?:\/\//i.test(url)) {
          setFetchedSiteUrl(url.replace(/\/$/, ''))
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const effectiveSiteUrl = React.useMemo(() => {
    if (fetchedSiteUrl) return fetchedSiteUrl
    if (typeof window !== 'undefined') return window.location.origin
    return 'https://example.com'
  }, [fetchedSiteUrl])

  const previewContent = React.useMemo(() => {
    if (isDev) return buildDevContent()
    const cleaned = (value ?? '')
      .split('\n')
      .filter((l) => !/^\s*sitemap\s*:/i.test(l))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    const base =
      cleaned.length > 0
        ? cleaned
        : ['User-agent: *', 'Disallow: /admin/', 'Disallow: /api/', 'Allow: /'].join('\n')
    return `${base}\n\nSitemap: ${effectiveSiteUrl}/sitemap.xml`
  }, [value, isDev, effectiveSiteUrl])

  const t =
    lang === 'tr'
      ? {
          label: 'robots.txt içeriği (YAYIN modu)',
          inactiveNote: 'GELİŞTİRME modunda devre dışı',
          description:
            'YAYIN modundayken servis edilir. GELİŞTİRME’ye geçince silinmez, tekrar YAYIN’a alındığında aynen geri döner. Sitemap satırı otomatik eklenir — buraya yazmanıza gerek yok.',
          previewLabel: 'Servis edilen /robots.txt (canlı önizleme)',
          previewHintDev: 'GELİŞTİRME modu — tüm botlar bloklanır.',
          previewHintLive:
            'YAYIN modu — yukarıdaki içerik + Sitemap satırı (Site Ayarları → Branding → Canlı Site Adresi’nden).',
        }
      : {
          label: 'robots.txt content (Live mode)',
          inactiveNote: 'inactive in DEVELOPMENT mode',
          description:
            'Used when site mode is Live. Saved value is preserved across Development → Live switches. The Sitemap line is auto-appended — no need to add it here.',
          previewLabel: 'Served /robots.txt (live preview)',
          previewHintDev: 'DEVELOPMENT mode — all bots blocked.',
          previewHintLive:
            'LIVE mode — content above + Sitemap line (from Site Settings → Branding → Canonical Site URL).',
        }

  return (
    <div
      className="field-type textarea-field"
      style={{ transition: 'opacity 180ms ease' }}
    >
      <div style={{ opacity: isDev ? 0.45 : 1, transition: 'opacity 180ms ease' }}>
        <label
          className="field-label"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span>{t.label}</span>
          {isDev && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                fontStyle: 'italic',
                color: 'var(--theme-elevation-500)',
              }}
            >
              — {t.inactiveNote}
            </span>
          )}
        </label>
        <textarea
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
          disabled={isDev}
          readOnly={isDev}
          rows={10}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 13,
            fontFamily: 'var(--font-mono, ui-monospace, "SF Mono", Menlo, monospace)',
            background: 'var(--theme-input-bg, var(--theme-elevation-50))',
            color: 'var(--theme-text)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            cursor: isDev ? 'not-allowed' : 'text',
            resize: 'vertical',
          }}
        />
        <p
          style={{
            fontSize: 12,
            color: 'var(--theme-elevation-500)',
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          {t.description}
        </p>
      </div>

      {/* PREVIEW BLOCK */}
      <div
        style={{
          marginTop: 18,
          padding: '14px 16px',
          background: 'var(--theme-elevation-50)',
          border: '1px dashed var(--theme-elevation-200)',
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--theme-elevation-600)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isDev ? '#dc2626' : '#16a34a',
            }}
          />
          <span>{t.previewLabel}</span>
          <code
            style={{
              fontSize: 11,
              fontWeight: 400,
              color: 'var(--theme-elevation-500)',
              marginLeft: 'auto',
            }}
          >
            GET {effectiveSiteUrl}/robots.txt
          </code>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '12px 14px',
            background: 'var(--theme-input-bg, var(--theme-bg))',
            border: '1px solid var(--theme-elevation-100)',
            borderRadius: 4,
            fontSize: 13,
            fontFamily: 'var(--font-mono, ui-monospace, "SF Mono", Menlo, monospace)',
            color: 'var(--theme-text)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {previewContent}
        </pre>
        <p
          style={{
            fontSize: 11,
            color: 'var(--theme-elevation-500)',
            marginTop: 8,
            marginBottom: 0,
            lineHeight: 1.4,
          }}
        >
          {isDev ? t.previewHintDev : t.previewHintLive}
        </p>
      </div>
    </div>
  )
}

export default RobotsTxtField
