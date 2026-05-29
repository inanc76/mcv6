import React from 'react'

type Props = {
  title?: string
  source?: 'youtube' | 'vimeo' | 'direct'
  url?: string
  poster?: { url?: string; alt?: string } | null
  autoplay?: boolean
}

const extractYouTubeId = (input: string): string | null => {
  const m = input.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/)
  return m ? m[1] : input.length === 11 ? input : null
}

const extractVimeoId = (input: string): string | null => {
  const m = input.match(/vimeo\.com\/(\d+)/)
  return m ? m[1] : /^\d+$/.test(input) ? input : null
}

export const VideoBlock: React.FC<Props> = ({ title, source = 'youtube', url, poster, autoplay }) => {
  if (!url) return null

  let embedSrc: string | null = null
  if (source === 'youtube') {
    const id = extractYouTubeId(url)
    if (id) embedSrc = `https://www.youtube.com/embed/${id}${autoplay ? '?autoplay=1&mute=1' : ''}`
  } else if (source === 'vimeo') {
    const id = extractVimeoId(url)
    if (id) embedSrc = `https://player.vimeo.com/video/${id}${autoplay ? '?autoplay=1&muted=1' : ''}`
  }

  return (
    <section data-block="video">
      {title && <h2>{title}</h2>}
      {source === 'direct' ? (
        <video
          src={url}
          poster={poster?.url}
          controls
          autoPlay={autoplay}
          muted={autoplay}
          playsInline
        />
      ) : embedSrc ? (
        <iframe
          src={embedSrc}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          title={title || 'Video'}
        />
      ) : (
        <p data-empty>[Video — geçersiz URL/ID]</p>
      )}
    </section>
  )
}
