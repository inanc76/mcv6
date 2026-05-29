import React from 'react'

type StatItem = { value: string; label: string; description?: string }

type Props = {
  title?: string
  items?: StatItem[]
}

export const StatsBlock: React.FC<Props> = ({ title, items }) => {
  if (!items?.length) return null

  return (
    <section data-block="stats">
      {title && <h2>{title}</h2>}
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            <strong data-stat-value>{item.value}</strong>
            <span data-stat-label>{item.label}</span>
            {item.description && <small>{item.description}</small>}
          </li>
        ))}
      </ul>
    </section>
  )
}
