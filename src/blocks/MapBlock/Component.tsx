import React from 'react'

type Marker = { label?: string; lat: number; lng: number }

type Props = {
  title?: string
  provider?: 'google' | 'mapbox' | 'iframe'
  latitude?: number
  longitude?: number
  zoom?: number
  embedUrl?: string
  markers?: Marker[]
}

export const MapBlock: React.FC<Props> = ({
  title,
  provider = 'google',
  latitude,
  longitude,
  zoom = 15,
  embedUrl,
  markers,
}) => {
  const getEmbedUrl = (): string | null => {
    if (provider === 'iframe' && embedUrl) return embedUrl
    if (provider === 'google' && latitude != null && longitude != null) {
      return `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`
    }
    return null
  }

  const url = getEmbedUrl()

  return (
    <section data-block="map">
      {title && <h2>{title}</h2>}
      {url ? (
        <iframe
          src={url}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          title={title || 'Map'}
        />
      ) : (
        <p data-empty>[Map — koordinat veya embed URL gerekli]</p>
      )}
      {markers?.length ? (
        <ul data-markers>
          {markers.map((m, i) => (
            <li key={i}>{m.label || `${m.lat}, ${m.lng}`}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
