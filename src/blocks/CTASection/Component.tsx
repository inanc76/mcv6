import React from 'react'

type Button = { label: string; url: string; variant?: 'primary' | 'secondary' | 'ghost'; newTab?: boolean }

type Props = {
  title: string
  subtitle?: string
  buttons?: Button[]
  background?: { image?: { url?: string; alt?: string } | null; overlay?: boolean }
}

export const CTASectionBlock: React.FC<Props> = ({ title, subtitle, buttons, background }) => {
  return (
    <section data-block="cta-section" data-overlay={background?.overlay}>
      {background?.image?.url && (
        <img data-bg src={background.image.url} alt={background.image.alt || ''} aria-hidden />
      )}
      <div data-content>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
        {buttons?.length ? (
          <div data-buttons>
            {buttons.map((btn, i) => (
              <a
                key={i}
                href={btn.url}
                data-variant={btn.variant || 'primary'}
                target={btn.newTab ? '_blank' : undefined}
                rel={btn.newTab ? 'noopener noreferrer' : undefined}
              >
                {btn.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
