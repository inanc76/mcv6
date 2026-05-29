import React from 'react'

type Logo = { image: { url?: string; alt?: string } | null; name?: string; url?: string }

type Props = {
  title?: string
  subtitle?: string
  logos?: Logo[]
}

export const LogoCloudBlock: React.FC<Props> = ({ title, subtitle, logos }) => {
  if (!logos?.length) return null

  return (
    <section data-block="logo-cloud">
      {title && <h2>{title}</h2>}
      {subtitle && <p>{subtitle}</p>}
      <ul>
        {logos.map((logo, i) => {
          const img = logo.image?.url ? (
            <img src={logo.image.url} alt={logo.image.alt || logo.name || ''} />
          ) : null
          return (
            <li key={i}>
              {logo.url ? <a href={logo.url} aria-label={logo.name}>{img}</a> : img}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
