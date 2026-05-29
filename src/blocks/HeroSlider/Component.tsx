'use client'
import React, { useState, useEffect } from 'react'

type Slide = {
  image?: { url?: string; alt?: string } | null
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaUrl?: string
}

type Props = {
  slides?: Slide[]
  autoPlay?: boolean
  interval?: number
}

export const HeroSliderBlock: React.FC<Props> = ({ slides, autoPlay = true, interval = 5000 }) => {
  const [index, setIndex] = useState(0)
  const total = slides?.length ?? 0

  useEffect(() => {
    if (!autoPlay || total <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % total), interval)
    return () => clearInterval(t)
  }, [autoPlay, interval, total])

  if (!slides?.length) return null
  const slide = slides[index]

  return (
    <section data-block="hero-slider">
      <div>
        {slide.image?.url && <img src={slide.image.url} alt={slide.image.alt || ''} />}
        {slide.title && <h2>{slide.title}</h2>}
        {slide.subtitle && <p>{slide.subtitle}</p>}
        {slide.ctaLabel && slide.ctaUrl && <a href={slide.ctaUrl}>{slide.ctaLabel}</a>}
      </div>
      {total > 1 && (
        <nav aria-label="Slider controls">
          <button onClick={() => setIndex((i) => (i - 1 + total) % total)} aria-label="Previous">‹</button>
          <span>{index + 1} / {total}</span>
          <button onClick={() => setIndex((i) => (i + 1) % total)} aria-label="Next">›</button>
        </nav>
      )}
    </section>
  )
}
