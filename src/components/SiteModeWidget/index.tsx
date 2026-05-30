'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useTranslation } from '@payloadcms/ui'

type Mode = 'live' | 'development'

const LABELS = {
  tr: {
    live: 'YAYIN',
    development: 'GELİŞTİRME',
    statusLive: 'Bu site şu an YAYIN modundadır ve tüm sayfaları indekslenir.',
    statusDev: 'Bu site şu an GELİŞTİRME modundadır ve sayfaları indekslenmez.',
    loading: 'Yükleniyor…',
    save: 'Kaydet',
    saving: 'Kaydediliyor…',
    saved: 'Kaydedildi ✓',
    cancel: 'İptal',
    saveError: 'Kayıt başarısız. Tekrar deneyin.',
  },
  en: {
    live: 'LIVE',
    development: 'DEVELOPMENT',
    statusLive: 'This site is in LIVE mode — all pages are indexed by search engines.',
    statusDev: 'This site is in DEVELOPMENT mode — no pages are indexed by search engines.',
    loading: 'Loading…',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved ✓',
    cancel: 'Cancel',
    saveError: 'Save failed. Please try again.',
  },
} as const

const LIVE_COLOR = '#16a34a'
const DEV_COLOR = '#dc2626'

const SiteModeWidget: React.FC = () => {
  const { i18n } = useTranslation()
  const lang: 'tr' | 'en' = i18n?.language === 'en' ? 'en' : 'tr'
  const t = LABELS[lang]

  const [savedMode, setSavedMode] = useState<Mode | null>(null)
  const [draftMode, setDraftMode] = useState<Mode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    fetch('/api/globals/seo-settings?depth=0', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const m: Mode = data?.siteMode === 'development' ? 'development' : 'live'
        setSavedMode(m)
        setDraftMode(m)
      })
      .catch(() => {
        if (!cancelled) setError(t.saveError)
      })
    return () => {
      cancelled = true
    }
  }, [t.saveError])

  const handleSave = () => {
    if (!draftMode || draftMode === savedMode || pending) return
    setError(null)
    setFlash(false)
    startTransition(async () => {
      try {
        const res = await fetch('/api/globals/seo-settings', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteMode: draftMode }),
        })
        if (!res.ok) {
          const body = await res.text().catch(() => '')
          throw new Error(`HTTP ${res.status} ${body.slice(0, 200)}`)
        }
        setSavedMode(draftMode)
        setFlash(true)
        setTimeout(() => setFlash(false), 2500)
      } catch (e) {
        setError(e instanceof Error ? `${t.saveError} (${e.message})` : t.saveError)
      }
    })
  }

  const handleCancel = () => {
    if (pending) return
    setDraftMode(savedMode)
    setError(null)
  }

  const isLive = draftMode === 'live'
  const isDev = draftMode === 'development'
  const hasChanges = draftMode != null && savedMode != null && draftMode !== savedMode
  const statusColor =
    draftMode == null ? 'var(--theme-elevation-500)' : isDev ? DEV_COLOR : LIVE_COLOR

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <div
          style={switchStyle}
          role="radiogroup"
          aria-label={lang === 'tr' ? 'Site Modu' : 'Site Mode'}
        >
          <button
            type="button"
            role="radio"
            aria-checked={isDev}
            onClick={() => setDraftMode('development')}
            disabled={pending || draftMode == null}
            style={{
              ...halfStyle,
              background: 'transparent',
              color: isDev ? DEV_COLOR : 'var(--theme-elevation-500)',
              borderColor: isDev ? DEV_COLOR : 'transparent',
              fontWeight: isDev ? 700 : 500,
              cursor: pending ? 'wait' : 'pointer',
            }}
          >
            {t.development}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={isLive}
            onClick={() => setDraftMode('live')}
            disabled={pending || draftMode == null}
            style={{
              ...halfStyle,
              background: 'transparent',
              color: isLive ? LIVE_COLOR : 'var(--theme-elevation-500)',
              borderColor: isLive ? LIVE_COLOR : 'transparent',
              fontWeight: isLive ? 700 : 500,
              cursor: pending ? 'wait' : 'pointer',
            }}
          >
            {t.live}
          </button>
        </div>

        <div style={{ ...messageStyle, color: statusColor }}>
          {draftMode == null ? t.loading : isLive ? t.statusLive : t.statusDev}
        </div>

        {hasChanges && (
          <div style={actionsStyle}>
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              style={{
                ...saveButtonStyle,
                cursor: pending ? 'wait' : 'pointer',
                opacity: pending ? 0.6 : 1,
              }}
            >
              {pending ? t.saving : t.save}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={pending}
              style={{ ...cancelButtonStyle, cursor: pending ? 'wait' : 'pointer' }}
            >
              {t.cancel}
            </button>
          </div>
        )}

        {flash && !hasChanges && <div style={flashStyle}>{t.saved}</div>}
      </div>

      {error && <div style={errorStyle}>{error}</div>}
    </div>
  )
}

export default SiteModeWidget

const containerStyle: React.CSSProperties = {
  padding: '18px 24px',
  margin: '0 0 24px',
  borderRadius: 12,
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-100)',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 20,
  flexWrap: 'wrap',
}

const switchStyle: React.CSSProperties = {
  display: 'inline-flex',
  background: 'var(--theme-elevation-100)',
  borderRadius: 9999,
  padding: 4,
  gap: 4,
  border: '1px solid var(--theme-elevation-150)',
  flexShrink: 0,
}

const halfStyle: React.CSSProperties = {
  padding: '8px 24px',
  fontSize: 13,
  letterSpacing: 0.5,
  border: '2px solid transparent',
  borderRadius: 9999,
  transition: 'border-color 180ms ease, color 180ms ease, font-weight 120ms ease',
  minWidth: 140,
}

const messageStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 1.4,
  flex: 1,
  minWidth: 240,
}

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexShrink: 0,
}

const saveButtonStyle: React.CSSProperties = {
  padding: '9px 20px',
  fontSize: 13,
  fontWeight: 600,
  border: 'none',
  borderRadius: 6,
  background: LIVE_COLOR,
  color: '#fff',
  transition: 'opacity 180ms ease',
}

const cancelButtonStyle: React.CSSProperties = {
  padding: '9px 16px',
  fontSize: 13,
  fontWeight: 500,
  border: '1px solid var(--theme-elevation-200)',
  borderRadius: 6,
  background: 'transparent',
  color: 'var(--theme-elevation-600)',
}

const flashStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: LIVE_COLOR,
  flexShrink: 0,
}

const errorStyle: React.CSSProperties = {
  fontSize: 13,
  color: DEV_COLOR,
}
