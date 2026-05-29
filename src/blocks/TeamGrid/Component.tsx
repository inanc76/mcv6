import React from 'react'

type SocialLink = { platform: string; url: string }
type Member = {
  photo?: { url?: string; alt?: string } | null
  name: string
  role?: string
  bio?: string
  social?: SocialLink[]
}

type Props = {
  title?: string
  subtitle?: string
  members?: Member[]
}

export const TeamGridBlock: React.FC<Props> = ({ title, subtitle, members }) => {
  if (!members?.length) return null

  return (
    <section data-block="team-grid">
      {title && <h2>{title}</h2>}
      {subtitle && <p>{subtitle}</p>}
      <ul>
        {members.map((m, i) => (
          <li key={i}>
            {m.photo?.url && <img src={m.photo.url} alt={m.photo.alt || m.name} />}
            <h3>{m.name}</h3>
            {m.role && <span data-role>{m.role}</span>}
            {m.bio && <p>{m.bio}</p>}
            {m.social?.length ? (
              <ul data-social>
                {m.social.map((s, j) => (
                  <li key={j}><a href={s.url} aria-label={s.platform}>{s.platform}</a></li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
