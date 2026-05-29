'use client'
import React, { useState } from 'react'

type Item = { heading: string; content: string }

type Props = {
  title?: string
  allowMultiple?: boolean
  items?: Item[]
}

export const AccordionBlock: React.FC<Props> = ({ title, allowMultiple = false, items }) => {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(allowMultiple ? prev : [])
      if (prev.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  if (!items?.length) return null

  return (
    <section data-block="accordion">
      {title && <h2>{title}</h2>}
      <ul>
        {items.map((item, i) => {
          const isOpen = openSet.has(i)
          return (
            <li key={i} data-open={isOpen}>
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`acc-${i}`}
              >
                <span>{item.heading}</span>
                <span aria-hidden>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && <div id={`acc-${i}`} role="region">{item.content}</div>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
