'use client'
import React, { useState } from 'react'

type Item = { image: { url?: string; alt?: string } | null; caption?: string }

type Props = {
  title?: string
  layout?: 'grid' | 'masonry'
  images?: Item[]
}

export const GalleryBlock: React.FC<Props> = ({ title, layout = 'grid', images }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (!images?.length) return null

  return (
    <section data-block="gallery" data-layout={layout}>
      {title && <h2>{title}</h2>}
      <ul>
        {images.map((it, i) => (
          <li key={i}>
            <button onClick={() => setLightboxIdx(i)} aria-label={`Open image ${i + 1}`}>
              {it.image?.url && <img src={it.image.url} alt={it.image.alt || it.caption || ''} />}
            </button>
            {it.caption && <figcaption>{it.caption}</figcaption>}
          </li>
        ))}
      </ul>

      {lightboxIdx !== null && images[lightboxIdx]?.image?.url && (
        <div role="dialog" aria-modal="true" data-lightbox>
          <button onClick={() => setLightboxIdx(null)} aria-label="Close">×</button>
          <button
            onClick={() => setLightboxIdx((i) => (i! - 1 + images.length) % images.length)}
            aria-label="Previous"
          >
            ‹
          </button>
          <img src={images[lightboxIdx].image!.url!} alt={images[lightboxIdx].image!.alt || ''} />
          <button
            onClick={() => setLightboxIdx((i) => (i! + 1) % images.length)}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </section>
  )
}
