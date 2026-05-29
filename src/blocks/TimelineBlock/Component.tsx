import React from 'react'

type Event = {
  date: string
  title: string
  description?: string
  image?: { url?: string; alt?: string } | null
}

type Props = {
  title?: string
  orientation?: 'vertical' | 'horizontal'
  events?: Event[]
}

export const TimelineBlock: React.FC<Props> = ({ title, orientation = 'vertical', events }) => {
  if (!events?.length) return null

  return (
    <section data-block="timeline" data-orientation={orientation}>
      {title && <h2>{title}</h2>}
      <ol>
        {events.map((ev, i) => (
          <li key={i}>
            <time data-date>{ev.date}</time>
            <div data-marker aria-hidden>•</div>
            <h3>{ev.title}</h3>
            {ev.description && <p>{ev.description}</p>}
            {ev.image?.url && <img src={ev.image.url} alt={ev.image.alt || ev.title} />}
          </li>
        ))}
      </ol>
    </section>
  )
}
