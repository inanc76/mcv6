import React from 'react'

type Product = {
  image?: { url?: string; alt?: string } | null
  name: string
  description?: string
  price?: string
  url?: string
  badge?: string
}

type Props = {
  title?: string
  subtitle?: string
  columns?: '2' | '3' | '4'
  products?: Product[]
}

export const ProductGridBlock: React.FC<Props> = ({ title, subtitle, columns = '3', products }) => {
  if (!products?.length) return null

  return (
    <section data-block="product-grid" data-columns={columns}>
      {title && <h2>{title}</h2>}
      {subtitle && <p>{subtitle}</p>}
      <ul>
        {products.map((p, i) => {
          const card = (
            <article>
              {p.badge && <span data-badge>{p.badge}</span>}
              {p.image?.url && <img src={p.image.url} alt={p.image.alt || p.name} />}
              <h3>{p.name}</h3>
              {p.description && <p>{p.description}</p>}
              {p.price && <span data-price>{p.price}</span>}
            </article>
          )
          return (
            <li key={i}>
              {p.url ? <a href={p.url}>{card}</a> : card}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
